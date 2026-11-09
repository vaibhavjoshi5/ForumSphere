const mysql = require('mysql2/promise')
const { AsyncLocalStorage } = require('node:async_hooks')
const fs = require('node:fs')
const path = require('node:path')
require('./config')

const transaction = new AsyncLocalStorage()
let pool
let ready

async function connectDB() {
  if (!pool) {
    const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_SSL, MYSQL_SSL_CA } = process.env
    if (!MYSQL_USER || !MYSQL_DATABASE)
      throw new Error('MYSQL_USER and MYSQL_DATABASE are required')
    pool = mysql.createPool({
      host: MYSQL_HOST || '127.0.0.1',
      port: Number(MYSQL_PORT || 3306),
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      connectionLimit: 5,
      timezone: 'Z',
      ssl: MYSQL_SSL === 'true' ? { ca: MYSQL_SSL_CA?.replace(/\\n/g, '\n') } : undefined
    })
  }

  if (!ready) {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
    ready = (async () => {
      for (const statement of schema.split(';').map(sql => sql.trim()).filter(Boolean))
        await pool.query(statement)
      return pool
    })().catch(error => {
      ready = undefined
      throw error
    })
  }
  return ready
}

connectDB.execute = async (sql, params) => {
  const connection = transaction.getStore() || await connectDB()
  const [rows] = await connection.execute(sql, params)
  return rows
}

connectDB.inTransaction = async (callback) => {
  const connection = await (await connectDB()).getConnection()
  try {
    await connection.beginTransaction()
    const result = await transaction.run(connection, callback)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

module.exports = connectDB
