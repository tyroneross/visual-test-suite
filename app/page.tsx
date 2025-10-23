'use client';

/**
 * Visual Testing Viewer - Production Ready
 *
 * This is a standalone visual regression testing viewer
 * that uses NPM packages for all functionality.
 *
 * Packages used:
 * - @your-org/visual-test-viewer (UI components)
 * - @your-org/visual-test-backend (API SDK)
 */

import { useState, useEffect } from 'react';
import { Navigation } from '../components/visual-testing/Navigation';
import { TestResultCard } from '../components/visual-testing/TestResultCard';
import { TestSummary } from '../components/visual-testing/TestSummary';
import type { VisualTestResult, TestStats } from '../components/visual-testing/TestResultCard';

export default function VisualTestViewer() {
  const [tests, setTests] = useState<VisualTestResult[]>([]);
  const [stats, setStats] = useState<TestStats>({ total: 0, passed: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch test results from API
  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/visual-tests/results');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTests(data.tests || []);

      // Calculate stats
      const passed = (data.tests || []).filter((t: VisualTestResult) => t.status === 'passed').length;
      const failed = (data.tests || []).filter((t: VisualTestResult) => t.status === 'failed').length;

      setStats({
        total: data.tests?.length || 0,
        passed,
        failed
      });

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch test results');
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading visual test results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-red-900 mb-2">Failed to Load Tests</h1>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchTests}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (tests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-900 mb-2">No Visual Tests Found</h1>
          <p className="text-sm text-gray-600 mb-4">
            Run your first visual regression test to see results here
          </p>
          <code className="block bg-gray-900 text-gray-100 px-4 py-3 rounded text-sm font-mono">
            npm run visual:test
          </code>
        </div>
      </div>
    );
  }

  // Main viewer
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Summary */}
        <TestSummary stats={stats} className="mb-6" />

        {/* Test List */}
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {tests.map((test, i) => (
            <TestResultCard
              key={`${test.title}-${test.viewport}-${i}`}
              test={test}
              onBaselineUpdate={fetchTests}
            />
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            Using: <code className="bg-gray-100 px-2 py-0.5 rounded">@your-org/visual-test-viewer</code>
            {' + '}
            <code className="bg-gray-100 px-2 py-0.5 rounded">@your-org/visual-test-backend</code>
          </p>
        </div>
      </div>
    </div>
  );
}
