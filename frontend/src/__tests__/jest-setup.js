Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:4000/api',
      },
    },
  },
  configurable: true,
});
