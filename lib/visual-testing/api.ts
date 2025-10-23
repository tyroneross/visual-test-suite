import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Visual Test Backend SDK
 * Provides API route handlers for Next.js visual regression testing
 *
 * Usage:
 * ```typescript
 * // app/api/visual-tests/[...path]/route.ts
 * import { createVisualTestAPI } from '@your-org/visual-test-backend';
 *
 * const api = createVisualTestAPI({
 *   resultsPath: './visual-reports/results.json',
 *   baselinesPath: './tests/visual/baselines',
 *   currentPath: './tests/visual/current',
 *   diffsPath: './tests/visual/diffs'
 * });
 *
 * export const GET = api.GET;
 * export const POST = api.POST;
 * export const PUT = api.PUT;
 * ```
 */

export interface VisualTestConfig {
  /** Path to Playwright results.json file */
  resultsPath?: string;
  /** Path to baseline images directory */
  baselinesPath?: string;
  /** Path to current screenshots directory */
  currentPath?: string;
  /** Path to diff images directory */
  diffsPath?: string;
  /** Maximum number of baseline versions to keep */
  maxVersions?: number;
  /** Enable CORS (for cross-origin requests) */
  enableCORS?: boolean;
}

interface BaselineVersion {
  timestamp: string;
  filename: string;
  setBy?: string;
  comment?: string;
}

/**
 * Creates API route handlers for visual testing
 */
export function createVisualTestAPI(config: VisualTestConfig = {}) {
  const {
    resultsPath = './visual-reports/results.json',
    baselinesPath = './tests/visual/baselines',
    currentPath = './tests/visual/current',
    diffsPath = './tests/visual/diffs',
    maxVersions = 10,
    enableCORS = true
  } = config;

  /**
   * Add CORS headers to response
   */
  function addCORSHeaders(response: NextResponse) {
    if (enableCORS) {
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    }
    return response;
  }

  /**
   * GET /api/visual-tests/results
   * Returns test results from Playwright JSON
   */
  async function handleGetResults() {
    try {
      const fullPath = path.join(process.cwd(), resultsPath);

      if (!fs.existsSync(fullPath)) {
        const response = NextResponse.json({
          tests: [],
          stats: { total: 0, passed: 0, failed: 0 }
        });
        return addCORSHeaders(response);
      }

      const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

      // Parse Playwright JSON structure: suites[0].suites[].specs[]
      const tests = (data.suites || []).flatMap((fileSuite: any) =>
        (fileSuite.suites || []).flatMap((describeSuite: any) =>
          (describeSuite.specs || []).map((spec: any) => ({
            title: spec.title || 'Untitled',
            status: spec.tests?.[0]?.results?.[0]?.status || 'skipped',
            duration: spec.tests?.[0]?.results?.[0]?.duration || 0,
            viewport: spec.tests?.[0]?.projectName || 'Unknown',
            error: spec.tests?.[0]?.results?.[0]?.error?.message
          }))
        )
      );

      const stats = {
        total: data.stats?.expected || 0,
        passed: data.stats?.passed || 0,
        failed: data.stats?.failed || 0
      };

      const response = NextResponse.json({ tests, stats });
      return addCORSHeaders(response);
    } catch (error) {
      const response = NextResponse.json(
        { error: 'Failed to read test results' },
        { status: 500 }
      );
      return addCORSHeaders(response);
    }
  }

  /**
   * POST /api/visual-tests/baseline
   * Set current screenshot as new baseline
   */
  async function handleSetBaseline(request: NextRequest) {
    try {
      const body = await request.json() as { testName: string; viewport: string };
      const { testName, viewport } = body;

      if (!testName || !viewport) {
        return addCORSHeaders(
          NextResponse.json(
            { error: 'Missing testName or viewport' },
            { status: 400 }
          )
        );
      }

      const sanitized = testName.toLowerCase().replace(/[^a-z0-9]/gi, '-');
      const baseDir = path.join(process.cwd(), 'tests/visual');
      const currentFile = path.join(baseDir, 'current', viewport, `${sanitized}.png`);
      const baselineFile = path.join(baseDir, 'baselines', viewport, `${sanitized}.png`);
      const historyDir = path.join(baseDir, 'baseline-history', viewport, sanitized);
      const metadataFile = path.join(historyDir, 'metadata.json');

      // Check if current screenshot exists
      if (!fs.existsSync(currentFile)) {
        return addCORSHeaders(
          NextResponse.json(
            { error: 'Current screenshot not found' },
            { status: 404 }
          )
        );
      }

      // Create history directory
      fs.mkdirSync(historyDir, { recursive: true });

      // Load or create metadata
      let metadata: { versions: BaselineVersion[] } = { versions: [] };
      if (fs.existsSync(metadataFile)) {
        metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
      }

      // Archive existing baseline
      if (fs.existsSync(baselineFile)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archivedFilename = `${timestamp}.png`;
        const archivedPath = path.join(historyDir, archivedFilename);

        fs.copyFileSync(baselineFile, archivedPath);

        metadata.versions.push({
          timestamp: new Date().toISOString(),
          filename: archivedFilename,
          comment: 'Replaced by new baseline'
        });

        // Keep only last N versions
        if (metadata.versions.length > maxVersions) {
          const oldVersion = metadata.versions.shift();
          if (oldVersion) {
            const oldPath = path.join(historyDir, oldVersion.filename);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }
        }

        fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
      }

      // Ensure baseline directory exists
      fs.mkdirSync(path.dirname(baselineFile), { recursive: true });

      // Copy current to baseline
      fs.copyFileSync(currentFile, baselineFile);

      const response = NextResponse.json({
        success: true,
        message: 'Baseline updated successfully',
        versionsStored: metadata.versions.length
      });

      return addCORSHeaders(response);
    } catch (error) {
      const response = NextResponse.json(
        { error: 'Failed to set baseline' },
        { status: 500 }
      );
      return addCORSHeaders(response);
    }
  }

  /**
   * GET /api/visual-tests/baseline?testName=X&viewport=Y
   * Get baseline version history
   */
  async function handleGetHistory(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const testName = searchParams.get('testName');
      const viewport = searchParams.get('viewport');

      if (!testName || !viewport) {
        return addCORSHeaders(
          NextResponse.json(
            { error: 'Missing testName or viewport' },
            { status: 400 }
          )
        );
      }

      const sanitized = testName.toLowerCase().replace(/[^a-z0-9]/gi, '-');
      const historyDir = path.join(
        process.cwd(),
        'tests/visual/baseline-history',
        viewport,
        sanitized
      );
      const metadataFile = path.join(historyDir, 'metadata.json');

      if (!fs.existsSync(metadataFile)) {
        return addCORSHeaders(
          NextResponse.json({
            versions: [],
            hasHistory: false
          })
        );
      }

      const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));

      const response = NextResponse.json({
        versions: metadata.versions,
        hasHistory: metadata.versions.length > 0
      });

      return addCORSHeaders(response);
    } catch (error) {
      const response = NextResponse.json(
        { error: 'Failed to get baseline history' },
        { status: 500 }
      );
      return addCORSHeaders(response);
    }
  }

  /**
   * Main request router
   */
  async function handleRequest(request: NextRequest) {
    const { pathname, searchParams } = new URL(request.url);
    const method = request.method;

    // Route: /api/visual-tests/results
    if (pathname.endsWith('/results') && method === 'GET') {
      return handleGetResults();
    }

    // Route: /api/visual-tests/baseline (GET with query params)
    if (pathname.endsWith('/baseline') && method === 'GET' && searchParams.has('testName')) {
      return handleGetHistory(request);
    }

    // Route: /api/visual-tests/baseline (POST)
    if (pathname.endsWith('/baseline') && method === 'POST') {
      return handleSetBaseline(request);
    }

    // 404 for unknown routes
    return addCORSHeaders(
      NextResponse.json({ error: 'Not found' }, { status: 404 })
    );
  }

  /**
   * OPTIONS handler for CORS preflight
   */
  async function handleOptions() {
    const response = new NextResponse(null, { status: 204 });
    return addCORSHeaders(response);
  }

  // Return route handlers
  return {
    GET: (request: NextRequest) => handleRequest(request),
    POST: (request: NextRequest) => handleRequest(request),
    PUT: (request: NextRequest) => handleRequest(request),
    OPTIONS: () => handleOptions()
  };
}
