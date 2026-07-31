const request = require('supertest')
const app = require('./app')

describe('public API', () => {
  test('health endpoint is available without authentication', async () => {
    await request(app)
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok' })
  })

  test('protected endpoints reject requests without a token', async () => {
    const response = await request(app).get('/api/profile').expect(401)
    expect(response.body.error).toBe('token missing or invalid')
  })
})
