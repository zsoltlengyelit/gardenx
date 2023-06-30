module.exports = {
    apps: [{
        script: "npx static-server ./ -n index.html -p 80",
        name: 'frontend',
        cwd: 'frontend'
    }, {
        name: 'backend',
        script: 'export $(grep -v \'^#\' .env.production | xargs); NODE_ENV=production npx fastify start --address 0.0.0.0 --port 1880 -l debug  -P ./app.js',
        cwd: 'backend'
    }]
}
