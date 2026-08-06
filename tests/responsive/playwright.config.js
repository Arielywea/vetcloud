// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: 'test-responsive.js',
  timeout: 60000,
  retries: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'report', open: 'never' }],
  ],
  use: {
    baseURL: 'https://vetcloud.vercel.app',
    headless: true,
    screenshot: 'off',
    trace: 'off',
  },
  projects: [
    { name: 'mobile', use: { viewport: { width: 375, height: 812 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1024, height: 768 } } },
    { name: 'wide', use: { viewport: { width: 1280, height: 800 } } },
  ],
});
