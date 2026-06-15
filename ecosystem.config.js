module.exports = {
    apps: [{
        name: 'frontend',
        script: "node frontend-server.mjs ./frontend",
        env: {
            PORT: '3000' // redirected with iptables
        }
    }, {
        name: 'backend',
        script: 'npx fastify start ./app.js',
        cwd: 'backend/dist',
        out_file: '/dev/null',
        error_file: '/dev/null',
        env: {
            NODE_OPTIONS: '--enable-source-maps',
            FASTIFY_PORT: '1880',
            FASTIFY_ADDRESS: '0.0.0.0',
            FASTIFY_PRETTY_LOGS: 'true',
            NODE_ENV: 'production',
            DB_PATH: '/home/pi/gardenx/data/db.sqlite',
            DB_NAME: 'gardenx',
            FASTIFY_LOG_LEVEL: 'info',
            MODBUS_SERVER_HOST: '192.168.0.200',
            MODBUS_SERVER_PORT: '4196'
        }
    }]
}
