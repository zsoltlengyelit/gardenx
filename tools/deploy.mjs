const host = `pi@raspberrypi.local`;
const targetFolder = `/home/pi/gardenx/`;

await within(async () => {
    await $`ssh ${host} 'cd ${targetFolder}; pm2 stop all'`;
    await $`ssh ${host} 'mkdir -p ${targetFolder}'`
    await $`ssh ${host} 'mkdir -p ${targetFolder}/data'`
    await $`scp -r ./build/* ${host}:${targetFolder}`

    await $`ssh ${host} 'cd ${targetFolder}/backend; npm init -y; npm i onoff@6 sequelize@6 sequelize-cli@6 sqlite3@5 fastify-cli@5 --loglevel verbose; export $(grep -v '^#' .env.production | xargs); NODE_ENV=production npx sequelize-cli db:migrate'`
    await $`ssh ${host} 'cd ${targetFolder}; pm2 reload ecosystem.config.js; pm2 restart ecosystem.config.js; pm2 save'`
});