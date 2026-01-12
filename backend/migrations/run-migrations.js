const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Migraciones ejecutadas correctamente');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en las migraciones:', error);
    process.exit(1);
  }
}

runMigrations();