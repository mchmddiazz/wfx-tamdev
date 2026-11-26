import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // viewport will be set by device
  },
  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
