const host = `pi@raspberrypi.local`;
const targetFolder = `/home/pi/gardenx/`;

await within(async () => {
    await $`ssh ${host} 'cd ${targetFolder}; pm2 stop all'`;
    await $`ssh ${host} 'mkdir -p ${targetFolder}'`
    await $`scp -r ./build/* ${host}:${targetFolder}`

    await $`ssh ${host} 'cd ${targetFolder}nodered/.node-red; npm install'`
    await $`ssh ${host} 'cd ${targetFolder}; pm2 restart all'`
    await $`ssh ${host} 'cd ${targetFolder}; pm2 save'`
});