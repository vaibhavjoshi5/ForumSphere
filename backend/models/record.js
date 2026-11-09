const { randomUUID } = require('node:crypto')
const db = require('../utils/db')

const models = {}
const column = name => '\x60' + name + '\x60'
const refId = value => value?.id ?? value?._id ?? value

async function expand(record, spec) {
  const value = record[spec.path]
  const resolve = async item => {
    if (item == null) return item
    const name = spec.model || record.constructor.references?.[spec.path]
    const target = name ? await models[name].findById(refId(item)) : item
    if (target && spec.populate) {
      for (const nested of [spec.populate].flat())
        await expand(target, nested)
    }
    if (target && spec.select) {
      const selected = { id: target.id }
      for (const key of spec.select.split(' ')) selected[key] = target[key]
      return selected
    }
    return target
  }
  if (Array.isArray(value))
    record[spec.path] = (await Promise.all(value.map(resolve))).filter(item => item != null)
  else if (value !== undefined)
    record[spec.path] = await resolve(value)
}

class Query {
  constructor(load) {
    this.load = load
    this.expansions = []
  }

  populate(path, select) {
    this.expansions.push(typeof path === 'string' ? { path, select } : path)
    return this
  }

  async run() {
    const result = await this.load()
    for (const record of [result].flat().filter(Boolean))
      for (const spec of this.expansions)
        await expand(record, spec)
    return result
  }

  then(resolve, reject) {
    return this.run().then(resolve, reject)
  }
}

module.exports = function defineModel(name, table, fields, { arrays = [], references = {}, required = [] } = {}) {
  class Record {
    static references = references

    constructor(data, stored = false) {
      this.id = data.id || randomUUID()
      Object.defineProperty(this, 'revision', { value: data.revision || 0, writable: true })
      for (const key of fields) {
        const value = data[key]
        this[key] = arrays.includes(key)
          ? (typeof value === 'string' ? JSON.parse(value) : value || [])
          : value
      }
      for (const request of this.requests || [])
        request.requestDate = new Date(request.requestDate)
      Object.defineProperty(this, 'stored', { value: stored, writable: true })
      Object.defineProperty(this, 'original', { value: stored ? this.values() : {}, writable: true })
    }

    values() {
      return Object.fromEntries(fields.map(key => {
        let value = this[key]
        if (references[key])
          value = Array.isArray(value) ? value.map(refId) : refId(value)
        if (key === 'requests')
          value = value.map(request => ({ ...request, userDetails: refId(request.userDetails) }))
        return [key, arrays.includes(key) ? JSON.stringify(value) : value ?? null]
      }))
    }

    async save() {
      const values = this.values()
      for (const key of required) {
        if (values[key] === null || values[key] === '') {
          const error = new Error(key + ' is required')
          error.name = 'ValidationError'
          throw error
        }
      }
      if (this.stored) {
        const changes = fields.filter(key => JSON.stringify(values[key]) !== JSON.stringify(this.original[key]))
        if (changes.length) {
          const assignments = changes.map(key => column(key) + ' = ?').join(', ')
          const result = await db.execute(
            'UPDATE ' + table + ' SET ' + assignments + ', revision = revision + 1 WHERE id = ? AND revision = ?',
            [...changes.map(key => values[key]), this.id, this.revision]
          )
          if (!result.affectedRows) {
            const error = new Error('Record changed. Refresh and retry.')
            error.name = 'WriteConflictError'
            throw error
          }
          this.revision++
        }
      } else {
        await db.execute('INSERT INTO ' + table + ' (id, ' + fields.map(column).join(', ') + ') VALUES (' + fields.map(() => '?').concat('?').join(', ') + ')', [this.id, ...fields.map(key => values[key])])
        this.stored = true
      }
      this.original = values
      return this
    }

    toJSON() {
      const { passwordHash, ...publicData } = this
      return publicData
    }

    static async load(filter, one) {
      const alternatives = filter.$or || [filter]
      const params = []
      const clauses = alternatives.map(criteria => Object.entries(criteria).map(([key, value]) => {
        if (key !== 'id' && !fields.includes(key)) throw new Error('Unknown query field ' + key)
        params.push(refId(value) ?? null)
        return column(key) + ' = ?'
      }).join(' AND ')).filter(Boolean)
      const where = clauses.length ? ' WHERE ' + clauses.map(clause => '(' + clause + ')').join(' OR ') : ''
      const rows = await db.execute('SELECT * FROM ' + table + where + (one ? ' LIMIT 1' : ''), params)
      const records = rows.map(row => new Record(row, true))
      return one ? records[0] || null : records
    }

    static find(filter) { return new Query(() => this.load(filter, false)) }
    static findOne(filter) { return new Query(() => this.load(filter, true)) }
    static findById(id) { return this.findOne({ id }) }

    static findByIdAndUpdate(id, data) {
      return new Query(async () => {
        const record = data instanceof Record ? data : await this.findById(id)
        if (!record) return null
        for (const key of fields)
          if (data[key] !== undefined) record[key] = data[key]
        await record.save()
        return this.findById(id)
      })
    }

    static async findByIdAndDelete(id) {
      await db.execute('DELETE FROM ' + table + ' WHERE id = ?', [refId(id)])
    }
  }

  models[name] = Record
  return Record
}
