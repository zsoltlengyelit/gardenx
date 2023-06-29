await within(async () => {
    await cd('./frontend')
    await $`npm run build`;
})

await within(async () => {
    await $`rm -rf build`
    await $`mkdir -p build/frontend`
    await $`mkdir -p build/backend`
    await $`cp -a ./frontend/dist/. ./build/frontend/`
    await $`cp ecosystem.config.js ./build/`
    await $`rsync -av nodered/.node-red ./build/nodered --exclude node_modules`
});
