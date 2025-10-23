/**
 * Composable Visual Test Summary Component
 * Can be extracted to NPM package: @your-org/visual-test-viewer
 */

export interface TestStats {
  total: number;
  passed: number;
  failed: number;
}

export interface TestSummaryProps {
  stats: TestStats;
  /** Custom className for styling */
  className?: string;
}

/**
 * Test Summary Component
 * Follows Calm Precision 6.1: Three-line hierarchy
 */
export function TestSummary({ stats, className = '' }: TestSummaryProps) {
  return (
    <div className={className}>
      {/* Line 1: Title */}
      <h1 className="text-lg font-medium text-gray-900">Visual Tests</h1>

      {/* Line 2: Primary stats */}
      <p className="text-sm text-gray-600 mt-1">
        <span className="text-green-600 font-medium">{stats.passed} passed</span>
        {stats.failed > 0 && (
          <>
            , <span className="text-red-600 font-medium">{stats.failed} failed</span>
          </>
        )}
      </p>

      {/* Line 3: Metadata */}
      <p className="text-xs text-gray-500 mt-1">{stats.total} total tests</p>
    </div>
  );
}
