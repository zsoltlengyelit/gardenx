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
        name: 'node-red',
        script: 'npx node-red -u ./.node-red',
        cwd: 'nodered'
    }]
}