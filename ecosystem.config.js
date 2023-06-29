module.exports = {
    apps: [{
        script: "serve",
        name: 'frontend',
        env: {
            PM2_SERVE_PATH: './frontend/',
            PM2_SERVE_PORT: '80',
            PM2_SERVE_SPA: 'true',
            PM2_SERVE_HOMEPAGE: '/index.html'
        }
    }, {
        name: 'backend',
        script: 'export $(grep -v \'^#\' .env.production | xargs); NODE_ENV=production npx fastify start --address 0.0.0.0 --port 1880 -l debug  -P ./app.js',
        cwd: 'backend'
    }]
}
