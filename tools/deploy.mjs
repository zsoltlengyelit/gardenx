import path from 'node:path';
import * as child_process from "child_process";

const host = `pi@raspberrypi.local`;
const targetFolder = `/home/pi/gardenx/`;

await within(async () => {
    await $`ssh ${host} 'cd ${targetFolder}; pm2 stop all; mkdir -p ${targetFolder}; mkdir -p ${path.join(targetFolder, 'data')}'`
    await $`scp -r ./build/* ${host}:${targetFolder}`

    const commands = [
        `cd ${path.join(targetFolder, 'backend')}`,
        `npm init -y`,
        'node ./server-setup.js',
        `export $(grep -v '^#' .env.production | xargs); NODE_ENV=production npx sequelize-cli db:migrate`,
        `cd ${targetFolder}`,
        `pm2 reload ecosystem.config.js`,
        `pm2 restart ecosystem.config.js`,
        `pm2 save`
    ];
    const singleCommand = commands.join(' ; ');

    const params = [
        host, `'${singleCommand}'`
    ];

    console.log(`ssh ${params.join(' ')}`)

    await child_process.execSync(`ssh ${params.join(' ')}`, {stdio: 'inherit'});
});