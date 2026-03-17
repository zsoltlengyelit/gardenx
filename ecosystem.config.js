module.exports = {
    apps: [{
        name: 'frontend',
        script: "node frontend-server.mjs ./frontend",
        env: {
            PORT: '3000' // redirected with iptables
        }
    }, {
        name: 'backend',
        script: 'npx fastify start ./dist/app.js',
        cwd: 'backend/dist',
        env: {
            NODE_OPTIONS: '--enable-source-maps',
            FASTIFY_PORT: '1880',
            FASTIFY_ADDRESS: '0.0.0.0',
            FASTIFY_PRETTY_LOGS: 'true',
            NODE_ENV: 'production',
            DB_PATH: '/home/pi/gardenx/data/db.sqlite',
            DB_NAME: 'gardenx',
            FASTIFY_LOG_LEVEL: 'trace',
            MODBUS_SERVER_HOST: 'wireshare.local',
            MODBUS_SERVER_PORT: '8502'
        }
    }]
}
