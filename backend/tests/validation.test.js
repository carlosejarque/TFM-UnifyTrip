const Joi = require('joi');
const { tripSchema } = require('../schemas/tripSchema');

describe('Trip Joi validation schema', () => {
  test('Acepta un trip válido', () => {
    const validTrip = {
      title: 'Vacaciones',
      description: 'Playa y relax',
      country: 'España',
      city: 'Valencia',
      start_date: '2024-07-01',
      end_date: '2024-07-10'
    };
    const { error } = tripSchema.validate(validTrip);
    expect(error).toBeUndefined();
  });

  test('Rechaza un trip sin título', () => {
    const invalidTrip = {
      description: 'Sin título',
      country: 'España',
      city: 'Madrid',
      start_date: '2024-07-01',
      end_date: '2024-07-10'
    };
    const { error } = tripSchema.validate(invalidTrip);
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch(/title/i);
  });

  test('Rechaza un trip con fecha inválida', () => {
    const invalidTrip = {
      title: 'Viaje raro',
      description: 'Fechas mal',
      country: 'España',
      city: 'Madrid',
      start_date: 'no-es-fecha',
      end_date: '2024-07-10'
    };
    const { error } = tripSchema.validate(invalidTrip);
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch(/start_date/i);
  });

  test('Rechaza un trip sin país', () => {
    const invalidTrip = {
      title: 'Viaje sin país',
      description: 'Sin país',
      city: 'Barcelona',
      start_date: '2024-07-01',
      end_date: '2024-07-10'
    };
    const { error } = tripSchema.validate(invalidTrip);
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch(/country/i);
  });
});
