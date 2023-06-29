await Promise.all([
    within(async () => {
        await cd('./frontend')
        await $`npm run build`;
    }),

    within(async () => {
        await cd('./backend')
        await $`npm run lint`;
        await $`rm -rf dist`
        await $`npx esbuild src/app.ts --outdir=dist --bundle --platform=node --external:pg-hstore --external:onoff`;
        await $`cp .env.production ./dist`;
        await $`cp -r config ./dist`
        await $`cp -r migrations ./dist`
    })
]);

await within(async () => {
    await $`rm -rf build`
    await $`mkdir -p build/frontend`
    await $`mkdir -p build/backend`
    await $`cp -a ./frontend/dist/. ./build/frontend/`
    await $`cp ecosystem.config.js ./build/`
    await $`cp -a ./backend/dist/ ./build/backend`
});
