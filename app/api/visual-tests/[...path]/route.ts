/**
 * Visual Testing API Routes
 *
 * This file uses the @your-org/visual-test-backend SDK
 * to provide all visual testing API endpoints.
 *
 * The SDK handles:
 * - Reading Playwright test results
 * - Managing baseline images
 * - Version history
 * - CORS configuration
 */

import { createVisualTestAPI } from '@/lib/visual-testing/api';

// Create API handlers using the SDK
const api = createVisualTestAPI({
  resultsPath: './visual-reports/results.json',
  baselinesPath: './tests/visual/baselines',
  currentPath: './tests/visual/current',
  diffsPath: './tests/visual/diffs',
  maxVersions: 10,
  enableCORS: true
});

// Export Next.js route handlers
export const GET = api.GET;
export const POST = api.POST;
export const PUT = api.PUT;
export const OPTIONS = api.OPTIONS;
