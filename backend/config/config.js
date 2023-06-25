console.log(process.env)

module.exports = {
    "development": {
        storage: process.env.DB_PATH,
        database: process.env.DB_NAME,
        dialect: "sqlite",
    },
    "production": {
        storage: process.env.DB_PATH,
        database: process.env.DB_NAME,
        dialect: "sqlite",
    }
}
