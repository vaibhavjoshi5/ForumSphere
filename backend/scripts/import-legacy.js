const fs = require('node:fs')
const path = require('node:path')
const db = require('../utils/db')
const User = require('../models/user')
const Community = require('../models/subGreddiit')
const Post = require('../models/post')
const Report = require('../models/report')

function decode(value) {
  if (Array.isArray(value)) return value.map(decode)
  if (value === null || typeof value !== 'object') return value
  if ('$oid' in value) return value.$oid
  if ('$numberInt' in value) return Number(value.$numberInt)
  if ('$numberLong' in value) return Number(value.$numberLong)
  if ('$date' in value) return new Date(decode(value.$date))
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decode(item)]))
}

async function importData(directory) {
  if (!directory) throw new Error('Provide the directory containing the four JSON exports')
  const collections = [
    ['users', 'users', User], ['subgreddiits', 'communities', Community],
    ['posts', 'posts', Post], ['reports', 'reports', Report]
  ].map(([file, table, Model]) => ({
    table, Model,
    rows: decode(JSON.parse(fs.readFileSync(path.join(directory, file + '.json'), 'utf8')))
  }))
  const pool = await db()
  try {
    await db.inTransaction(async () => {
      for (const { table } of collections) {
        const [row] = await db.execute('SELECT COUNT(*) AS total FROM ' + table, [])
        if (Number(row.total)) throw new Error('Import requires empty ForumSphere tables')
      }
      for (const { rows, Model } of collections)
        for (const row of rows) {
          if (!row._id) throw new Error('Export record is missing its ID')
          await new Model({ ...row, id: row._id }).save()
        }
    })
    console.log('Imported ' + collections.reduce((total, collection) => total + collection.rows.length, 0) + ' records')
  } finally {
    await pool.end()
  }
}

importData(process.argv[2]).catch(error => {
  console.error(error.code || error.message)
  process.exitCode = 1
})
