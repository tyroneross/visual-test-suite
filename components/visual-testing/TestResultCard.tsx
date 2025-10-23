'use client';

import { useState } from 'react';
import { BaselineActions } from './BaselineActions';

/**
 * Composable Visual Test Result Card
 * Can be extracted to NPM package: @your-org/visual-test-viewer
 */

export interface VisualTestResult {
  title: string;
  status: 'passed' | 'failed' | 'timedOut' | 'skipped';
  duration: number;
  viewport: string;
  error?: string;
}

export interface TestResultCardProps {
  test: VisualTestResult;
  /** Base path for images, defaults to /visual-images */
  imagePath?: string;
  /** Custom className for styling */
  className?: string;
  /** Callback when expanded state changes */
  onExpandChange?: (expanded: boolean) => void;
  /** Callback when baseline is updated */
  onBaselineUpdate?: () => void;
}

/**
 * Chevron Down Icon Component
 */
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: VisualTestResult['status'] }) {
  const colors = {
    passed: 'text-green-600',
    failed: 'text-red-600',
    timedOut: 'text-amber-600',
    skipped: 'text-gray-500'
  };

  const labels = {
    passed: 'Passed',
    failed: 'Failed',
    timedOut: 'Timed out',
    skipped: 'Skipped'
  };

  return (
    <span className={`text-sm font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

/**
 * Screenshot Comparison Component
 */
function ScreenshotComparison({
  baseline,
  current
}: {
  baseline: string;
  current: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ScreenshotPanel
        src={baseline}
        label="Baseline"
        alt="Baseline screenshot"
      />
      <ScreenshotPanel
        src={current}
        label="Current"
        alt="Current screenshot"
      />
    </div>
  );
}

/**
 * Individual Screenshot Panel
 */
function ScreenshotPanel({
  src,
  label,
  alt
}: {
  src: string;
  label: string;
  alt: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-700 mb-2">{label}</p>
      <div className="border border-gray-200 rounded overflow-hidden bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="w-full h-auto"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f5f5f5"/><text x="50%" y="50%" text-anchor="middle" fill="%23999" font-family="sans-serif" font-size="14">${label} not found</text></svg>`;
          }}
        />
      </div>
    </div>
  );
}

/**
 * Main Test Result Card Component
 * Follows Calm Precision 6.1: Three-line hierarchy, Progressive disclosure
 */
export function TestResultCard({
  test,
  imagePath = '/visual-images',
  className = '',
  onExpandChange,
  onBaselineUpdate
}: TestResultCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    const newState = !expanded;
    setExpanded(newState);
    onExpandChange?.(newState);
  };

  // Generate image URLs
  const sanitized = test.title.toLowerCase().replace(/[^a-z0-9]/gi, '-');
  const baseline = `${imagePath}/baselines/${encodeURIComponent(test.viewport)}/${sanitized}.png`;
  const current = `${imagePath}/current/${encodeURIComponent(test.viewport)}/${sanitized}.png`;

  return (
    <div className={`p-4 ${className}`}>
      {/* Test Info - Three-line structure (CP 6.1) */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Line 1: Title */}
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {test.title}
          </h3>

          {/* Line 2: Status + Viewport */}
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={test.status} />
            <span className="text-sm text-gray-600">{test.viewport}</span>
          </div>

          {/* Line 3: Duration */}
          <p className="text-xs text-gray-500 mt-1">
            {(test.duration / 1000).toFixed(1)}s
          </p>

          {/* Error message (if failed) */}
          {test.error && (
            <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded font-mono text-[10px] leading-tight max-h-20 overflow-y-auto">
              {test.error.split('\n')[0]}
            </p>
          )}
        </div>

        {/* Expand/Collapse Button (CP 6.1: Progressive disclosure) */}
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50 transition-colors min-w-[80px] justify-center"
          aria-expanded={expanded}
          aria-label={expanded ? 'Hide screenshots' : 'View screenshots'}
        >
          <span>{expanded ? 'Hide' : 'View'}</span>
          <ChevronIcon expanded={expanded} />
        </button>
      </div>

      {/* Screenshot Comparison - Progressive disclosure */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in duration-200">
          {/* Baseline Actions - Set as baseline & view history */}
          <div className="mb-4 flex justify-end relative">
            <BaselineActions
              testName={test.title}
              viewport={test.viewport}
              onBaselineSet={onBaselineUpdate}
            />
          </div>

          {/* Screenshot Comparison */}
          <ScreenshotComparison baseline={baseline} current={current} />
        </div>
      )}
    </div>
  );
}
