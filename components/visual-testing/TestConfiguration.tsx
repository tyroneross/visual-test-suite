'use client';

import { useState } from 'react';

export interface TestConfig {
  name: string;
  url: string;
  viewports: string[];
  fullPage: boolean;
  waitForSelector?: string;
}

export function TestConfiguration() {
  const [configs, setConfigs] = useState<TestConfig[]>([]);
  const [newConfig, setNewConfig] = useState<TestConfig>({
    name: '',
    url: '',
    viewports: ['desktop'],
    fullPage: true,
    waitForSelector: ''
  });
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const viewportOptions = [
    { id: 'mobile', label: 'Mobile (375×667)', width: 375, height: 667 },
    { id: 'tablet', label: 'Tablet (768×1024)', width: 768, height: 1024 },
    { id: 'desktop', label: 'Desktop (1920×1080)', width: 1920, height: 1080 },
  ];

  const addConfig = () => {
    if (!newConfig.name || !newConfig.url) {
      setMessage({ type: 'error', text: 'Name and URL are required' });
      return;
    }

    setConfigs([...configs, newConfig]);
    setNewConfig({
      name: '',
      url: '',
      viewports: ['desktop'],
      fullPage: true,
      waitForSelector: ''
    });
    setMessage({ type: 'success', text: `Added "${newConfig.name}" to test suite` });
  };

  const removeConfig = (index: number) => {
    setConfigs(configs.filter((_, i) => i !== index));
  };

  const generateTests = async () => {
    if (configs.length === 0) {
      setMessage({ type: 'error', text: 'Add at least one test configuration' });
      return;
    }

    setGenerating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/visual-tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setMessage({
        type: 'success',
        text: `Generated ${data.filesCreated} test file(s). Run "npm run visual:test" to execute.`
      });

      // Clear configs after successful generation
      setConfigs([]);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to generate tests'
      });
    } finally {
      setGenerating(false);
    }
  };

  const toggleViewport = (viewportId: string) => {
    const viewports = newConfig.viewports.includes(viewportId)
      ? newConfig.viewports.filter(v => v !== viewportId)
      : [...newConfig.viewports, viewportId];

    setNewConfig({ ...newConfig, viewports });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Configure Visual Tests
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Add URLs to test and select which viewports to capture. Tests will be auto-generated.
      </p>

      {/* Message Banner */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm ${
            message.type === 'success' ? 'text-green-700' : 'text-red-700'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Add New Test Form */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Test</h3>

        <div className="space-y-4">
          {/* Test Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Name
            </label>
            <input
              type="text"
              value={newConfig.name}
              onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
              placeholder="e.g., Homepage, Market Trends Page"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL to Test
            </label>
            <input
              type="url"
              value={newConfig.url}
              onChange={(e) => setNewConfig({ ...newConfig, url: e.target.value })}
              placeholder="http://localhost:3000/markettrends"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          {/* Viewports */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Viewports to Test
            </label>
            <div className="space-y-2">
              {viewportOptions.map((viewport) => (
                <label key={viewport.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newConfig.viewports.includes(viewport.id)}
                    onChange={() => toggleViewport(viewport.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{viewport.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-700 font-medium">
              Advanced Options
            </summary>
            <div className="mt-3 space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newConfig.fullPage}
                  onChange={(e) => setNewConfig({ ...newConfig, fullPage: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Capture full page (scroll)</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wait for selector (optional)
                </label>
                <input
                  type="text"
                  value={newConfig.waitForSelector}
                  onChange={(e) => setNewConfig({ ...newConfig, waitForSelector: e.target.value })}
                  placeholder="e.g., [data-testid=&quot;chart&quot;]"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </details>

          {/* Add Button */}
          <button
            onClick={addConfig}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add to Test Suite
          </button>
        </div>
      </div>

      {/* Test Suite List */}
      {configs.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Test Suite ({configs.length} test{configs.length !== 1 ? 's' : ''})
          </h3>
          <div className="space-y-2">
            {configs.map((config, index) => (
              <div key={index} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg bg-white">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{config.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{config.url}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Viewports: {config.viewports.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => removeConfig(index)}
                  className="ml-3 text-red-600 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Tests Button */}
      {configs.length > 0 && (
        <button
          onClick={generateTests}
          disabled={generating}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {generating ? 'Generating...' : `Generate ${configs.length} Test${configs.length !== 1 ? 's' : ''}`}
        </button>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Quick Start</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Enter the URL of a page you want to test (e.g., http://localhost:3000)</li>
          <li>Select which device sizes to test (Mobile, Tablet, Desktop)</li>
          <li>Click "Add to Test Suite"</li>
          <li>Repeat for all pages you want to test</li>
          <li>Click "Generate Tests" to create Playwright test files</li>
          <li>Run <code className="bg-blue-100 px-1 rounded">npm run visual:test</code> in terminal</li>
        </ol>
      </div>
    </div>
  );
}
