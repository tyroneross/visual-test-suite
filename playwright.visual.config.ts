import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for visual regression testing
 * Walking Skeleton - Iteration 0
 */
export default defineConfig({
  testDir: './tests/visual',
  outputDir: './tests/visual/results',

  // Parallel execution for performance
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,

  // Retry logic for flaky tests
  retries: process.env.CI ? 1 : 0,

  // Test timeout
  timeout: 30 * 1000,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'visual-reports', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'visual-reports/results.json' }]
  ],

  use: {
    // Base URL for the application
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Screenshot settings for consistency
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },

    // Ensure consistent rendering
    animation: 'disabled',

    // Wait for network idle to ensure content loaded
    waitForLoadState: 'networkidle',

    // Viewport size for desktop
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors for local development
    ignoreHTTPSErrors: true
  },

  // Define projects for different viewports
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      }
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 }
      }
    },
    {
      name: 'Tablet',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 }
      }
    }
  ],

  // Development server configuration
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000
  }
});