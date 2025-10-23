'use client';

import { useState } from 'react';

/**
 * Baseline Actions Component
 * Handles setting new baselines and viewing history
 * NPM-ready, composable component
 */

export interface BaselineActionsProps {
  testName: string;
  viewport: string;
  /** API base URL, defaults to /api/visual-tests */
  apiBase?: string;
  /** Callback after baseline is set */
  onBaselineSet?: () => void;
  /** Custom className */
  className?: string;
}

export function BaselineActions({
  testName,
  viewport,
  apiBase = '/api/visual-tests',
  onBaselineSet,
  className = ''
}: BaselineActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSetBaseline = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${apiBase}/baseline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testName, viewport })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Baseline updated! ${data.versionsStored} versions stored.`
        });
        onBaselineSet?.();

        // Auto-hide success message after 3s
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to set baseline'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Set as Baseline Button */}
      <button
        onClick={handleSetBaseline}
        disabled={loading}
        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded transition-colors flex items-center gap-2"
        aria-label="Set current screenshot as new baseline"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Setting...</span>
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Set as Baseline</span>
          </>
        )}
      </button>

      {/* View History Button */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center gap-2"
        aria-label="View baseline history"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 3V8L11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <span>History</span>
      </button>

      {/* Success/Error Message */}
      {message && (
        <div className={`px-3 py-1.5 text-sm rounded flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="8" r="8"/>
              <path d="M6 8L7.5 9.5L10 6.5" stroke="white" strokeWidth="2" fill="none"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="8" r="8"/>
              <path d="M5 5L11 11M11 5L5 11" stroke="white" strokeWidth="2"/>
            </svg>
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* History Panel (placeholder for now) */}
      {showHistory && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Baseline History</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close history"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600">
            History viewer coming soon...
          </p>
        </div>
      )}
    </div>
  );
}
