'use client';

import Link from 'next/link';
import { TestConfiguration } from '@/components/visual-testing/TestConfiguration';
import { Navigation } from '@/components/visual-testing/Navigation';

export default function ConfigurePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Important Workflow Notice */}
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Complete Workflow (3 Steps)
              </h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span><strong>Configure below:</strong> Add URLs and click "Generate Tests" button</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span><strong>Run in terminal:</strong> <code className="bg-gray-900 text-gray-100 px-2 py-1 rounded text-xs">npm run visual:test</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span><strong>View results:</strong> Go to "Test Results" tab above to see screenshots and set baselines</span>
                </li>
              </ol>
              <p className="mt-3 text-xs text-blue-700 font-medium">
                💡 Results won't appear until you complete Step 2!
              </p>
            </div>
          </div>
        </div>
        <TestConfiguration />

        {/* How Baselines Work Section */}
        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📸 How Baselines Work with URL-Based Testing
          </h3>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-medium text-gray-900 mb-2">Step 1: Generate Tests</p>
              <p>Add URLs above and click "Generate Tests". This creates Playwright test files.</p>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-2">Step 2: Run Tests</p>
              <code className="block bg-gray-900 text-gray-100 px-4 py-2 rounded mt-2">
                npm run visual:test
              </code>
              <p className="mt-2">This captures screenshots of your URLs at different viewports.</p>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-2">Step 3: Set Baselines</p>
              <p>
                Go to <Link href="/" className="text-blue-600 hover:underline">Test Results</Link> page.
                Click "Set as Baseline" on any test to save it as the expected result.
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-2">Step 4: Future Tests</p>
              <p>
                Next time you run tests, Playwright compares new screenshots against baselines.
                Any visual differences are highlighted automatically.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">💡 Pro Tip:</span> Baselines are stored in <code className="bg-blue-100 px-1 rounded">tests/visual/baselines/</code>
              and work across all deployments. Once set, they persist until you update them.
            </p>
          </div>
        </div>

        {/* Workflow Diagram */}
        <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Complete Workflow
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-xs">1</span>
              <span className="text-gray-700">Add URLs to test (this page)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-xs">2</span>
              <span className="text-gray-700">Click "Generate Tests" → Creates Playwright files</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-xs">3</span>
              <span className="text-gray-700">Run <code className="bg-purple-100 px-2 py-1 rounded">npm run visual:test</code> in terminal</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-xs">4</span>
              <span className="text-gray-700">View results on Test Results page</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-xs">5</span>
              <span className="text-gray-700">Click "Set as Baseline" to save expected screenshots</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold text-xs">✓</span>
              <span className="text-gray-700">Future tests automatically compare against baselines</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
