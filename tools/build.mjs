await within(async () => {
    await cd('./frontend')
    await $`npm run build`;
});

await within(async () => {
    await cd('./backend')
    await $`npm run build:ts`;
});

await within(async () => {
    await $`rm -rf build`
    await $`mkdir -p build/frontend`
    await $`mkdir -p build/backend`
    await $`cp -a ./frontend/dist/. ./build/frontend/`
    await $`cp ecosystem.config.js ./build/`
    await $`cp -a ./backend/dist ./build/backend`
});
