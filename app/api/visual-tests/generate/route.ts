import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface TestConfig {
  name: string;
  url: string;
  viewports: string[];
  fullPage: boolean;
  waitForSelector?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { configs } = await request.json() as { configs: TestConfig[] };

    if (!configs || configs.length === 0) {
      return NextResponse.json(
        { error: 'No configurations provided' },
        { status: 400 }
      );
    }

    const testsDir = path.join(process.cwd(), 'tests', 'visual');

    // Ensure directory exists
    if (!fs.existsSync(testsDir)) {
      fs.mkdirSync(testsDir, { recursive: true });
    }

    // Generate test file content
    const testContent = generatePlaywrightTest(configs);

    // Write test file
    const testFilePath = path.join(testsDir, 'auto-generated.spec.ts');
    fs.writeFileSync(testFilePath, testContent);

    // Also update Playwright config if needed
    const configPath = path.join(process.cwd(), 'playwright.visual.config.ts');
    if (!fs.existsSync(configPath)) {
      const configContent = generatePlaywrightConfig(configs);
      fs.writeFileSync(configPath, configContent);
    }

    return NextResponse.json({
      success: true,
      filesCreated: 1,
      testFile: testFilePath,
      message: 'Test files generated successfully. Run "npm run visual:test" to execute.'
    });

  } catch (error) {
    console.error('Failed to generate tests:', error);
    return NextResponse.json(
      { error: 'Failed to generate test files' },
      { status: 500 }
    );
  }
}

function generatePlaywrightTest(configs: TestConfig[]): string {
  const viewportMap: Record<string, { width: number; height: number }> = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 }
  };

  // Group configs by viewport
  const testsByViewport: Record<string, TestConfig[]> = {};

  configs.forEach(config => {
    config.viewports.forEach(viewport => {
      if (!testsByViewport[viewport]) {
        testsByViewport[viewport] = [];
      }
      testsByViewport[viewport].push(config);
    });
  });

  let content = `/**
 * Auto-Generated Visual Regression Tests
 * Generated from UI Configuration
 *
 * To run these tests:
 * npm run visual:test
 */

import { test, expect } from '@playwright/test';

`;

  // Generate tests for each viewport
  Object.entries(testsByViewport).forEach(([viewport, viewportConfigs]) => {
    const { width, height } = viewportMap[viewport];

    content += `
test.describe('${viewport.charAt(0).toUpperCase() + viewport.slice(1)} Viewport (${width}×${height})', () => {
  test.use({ viewport: { width: ${width}, height: ${height} } });

`;

    viewportConfigs.forEach(config => {
      const sanitizedName = config.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

      content += `  test('${config.name}', async ({ page }) => {
    await page.goto('${config.url}');
`;

      if (config.waitForSelector) {
        content += `    await page.waitForSelector('${config.waitForSelector}');
`;
      }

      content += `
    await expect(page).toHaveScreenshot('${sanitizedName}.png', {
      fullPage: ${config.fullPage},
      animations: 'disabled'
    });
  });

`;
    });

    content += `});

`;
  });

  return content;
}

function generatePlaywrightConfig(configs: TestConfig[]): string {
  const uniqueViewports = new Set<string>();
  configs.forEach(config => {
    config.viewports.forEach(v => uniqueViewports.add(v));
  });

  const viewportMap: Record<string, { width: number; height: number }> = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 }
  };

  const projects = Array.from(uniqueViewports).map(viewport => {
    const { width, height } = viewportMap[viewport];
    return `    {
      name: '${viewport.charAt(0).toUpperCase() + viewport.slice(1)} ${width}×${height}',
      use: {
        viewport: { width: ${width}, height: ${height} }
      }
    }`;
  });

  return `import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate: 'tests/visual/{testFileDir}/{testFileName}/{arg}{ext}',
  outputDir: 'visual-reports',

  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
${projects.join(',\n')}
  ],

  reporter: [
    ['list'],
    ['json', { outputFile: 'visual-reports/results.json' }],
    ['html', { outputFolder: 'visual-reports/html', open: 'never' }]
  ],
});
`;
}
