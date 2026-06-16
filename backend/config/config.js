module.exports = {
  development: {
    storage: process.env.DB_PATH,
    database: process.env.DB_NAME,
    dialect: 'sqlite',
  },
  production: {
    storage: '/home/pi/gardenx/data/db.sqlite',
    database: 'gardenx',
    dialect: 'sqlite',
  }
};
