const request = require('supertest');
const app = require('../index'); 
const User = require('../models/User');

describe('Auth Controller', () => {
  const testUser = {
    username: 'authuser',
    password: 'AuthTest123'
  };

   beforeAll(async () => {
    await User.destroy({ where: { username: testUser.username } });
  });

  test('Registro de usuario nuevo', async () => {
    const res = await request(app)
      .post('/users/register')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/registered/i);
  });

  test('No permite registrar el mismo usuario dos veces', async () => {
    const res = await request(app)
      .post('/users/register')
      .send(testUser);
    expect(res.statusCode).toBe(409); 
    expect(res.body.message).toMatch(/exists/i);
  });

  test('Login con usuario y contraseña correctos', async () => {
    const res = await request(app)
      .post('/users/login')
      .send(testUser);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/login/i);
    expect(res.body.token).toBeDefined();
  });

  test('Login falla con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({
        username: testUser.username,
        password: 'wrongpass'
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  test('Login falla con usuario no existente', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({
        username: 'nonexistentuser',
        password: 'doesntmatter'
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });
});
