module.exports = {
    apps: [{
        script: "npx static-server ./ -n index.html -p 80",
        name: 'frontend',
        cwd: 'frontend'
    }, {
        name: 'backend',
        script: 'npx fastify start ./app.js',
        cwd: 'backend',
        env: {
            FASTIFY_PORT: '1880',
            FASTIFY_ADDRESS: '0.0.0.0',
            FASTIFY_PRETTY_LOGS: 'true',
            NODE_ENV: 'production',
            DB_PATH: '/home/pi/gardenx/data/db.sqlite',
            DB_NAME: 'gardenx',
            FASTIFY_LOG_LEVEL: 'debug'
        }
    }]
}
