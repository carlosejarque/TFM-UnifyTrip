const request = require('supertest');
const app = require('../index'); 

let token;
let tripId;


beforeAll(async () => {

  await request(app).post('/users/register').send({
    username: 'testuser',
    password: 'Test1234'
  });

  const res = await request(app).post('/users/login').send({
    username: 'testuser',
    password: 'Test1234'
  });
  token = res.body.token;
});


test('Crea un trip (requiere token JWT)', async () => {
  const res = await request(app)
    .post('/trips')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Test Trip',
      description: 'Viaje de prueba',
      country: 'España',
      city: 'Madrid',
      start_date: '2024-07-10',
      end_date: '2024-07-12'
    });
  expect(res.statusCode).toBe(201);
  expect(res.body.trip.title).toBe('Test Trip');
  tripId = res.body.trip.id;
});

test('Lee todos los trips', async () => {
  const res = await request(app).get('/trips');
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});


test('Lee un trip por id', async () => {
  const res = await request(app).get(`/trips/${tripId}`);
  expect(res.statusCode).toBe(200);
  expect(res.body.title).toBe('Test Trip');
});


test('Actualiza un trip (requiere token JWT)', async () => {
  const res = await request(app)
    .put(`/trips/${tripId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Test Trip Modificado',
      description: 'Viaje modificado',
      country: 'España',
      city: 'Madrid',
      start_date: '2024-07-10',
      end_date: '2024-07-12'
    });
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toMatch(/updated/i);
});


test('Elimina un trip (requiere token JWT)', async () => {
  const res = await request(app)
    .delete(`/trips/${tripId}`)
    .set('Authorization', `Bearer ${token}`);
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toMatch(/deleted/i);
});


test('Fallo al crear trip sin token JWT', async () => {
  const res = await request(app)
    .post('/trips')
    .send({
      title: 'No Auth Trip',
      description: 'Intento sin JWT',
      country: 'España',
      city: 'Madrid',
      start_date: '2024-07-10',
      end_date: '2024-07-12'
    });
  expect(res.statusCode).toBe(401); 
});

const sequelize = require('../models'); 
afterAll(async () => {
  await sequelize.close();
});
