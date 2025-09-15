export default defineNitroConfig({
  // prevent nitro picking up tanstack routes
  // https://github.com/TanStack/router/issues/4432
  apiDir: 'non-existent-dir',
  routesDir: 'non-existent-dir',
})
