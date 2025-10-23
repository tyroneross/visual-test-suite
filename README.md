# 📸 Visual Test Suite

**URL-based visual regression testing made simple.** Configure tests through a clean UI, run automated Playwright screenshots across multiple viewports, and manage baselines with version history—all without writing code.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.48-green)](https://playwright.dev/)

---

## ✨ Features

- **🎯 URL-Based Configuration** - Add URLs via UI form, automatically generate Playwright tests
- **📱 Multi-Viewport Testing** - Mobile, Tablet, Desktop viewports built-in
- **🔄 Baseline Management** - Set baselines, track versions, compare changes
- **🎨 Visual Diff Viewer** - Side-by-side comparison with pixelmatch highlighting
- **📊 Test Results Dashboard** - Real-time results with pass/fail statistics
- **💾 Local-First Storage** - All data stored in your project (Git-friendly)
- **⚡ Fast Setup** - No complex configuration, works out of the box

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Start the Viewer

```bash
npm run dev
```

Open [http://localhost:3100](http://localhost:3100) to see the test results dashboard.

### 3. Configure Tests

1. Navigate to **Configure Tests** tab
2. Add URLs you want to test:
   ```
   Name: Homepage
   URL: https://example.com
   Viewports: Mobile, Tablet, Desktop
   ```
3. Click **Generate Tests**

### 4. Run Tests

```bash
npm run visual:test
```

This runs Playwright and captures screenshots for all configured URLs across all viewports.

### 5. View Results & Set Baselines

1. Go back to **Test Results** tab
2. Review screenshots
3. Click **Set as Baseline** for tests you want to save as expected results
4. Future test runs will compare against these baselines

---

## 📖 Complete Workflow

### The 3-Step Process

```
┌─────────────────────┐
│  1. Configure URLs  │  ← Add URLs via UI or manually
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Run Tests       │  ← npm run visual:test
│  (Playwright)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. Review Results  │  ← View in dashboard, set baselines
└─────────────────────┘
```

### Baseline Management

**First Run:**
- No baselines exist yet
- All tests show as "NEW"
- Review screenshots and click "Set as Baseline"

**Subsequent Runs:**
- New screenshots compared against baselines
- Visual differences highlighted in diff images
- Pass/fail status shows in dashboard

**Updating Baselines:**
- When you intentionally change UI, run tests
- Review diff to confirm changes are expected
- Click "Update Baseline" to replace old baseline

---

## 🗂️ Project Structure

```
visual-test-suite/
├── app/
│   ├── page.tsx                    # Test results dashboard
│   ├── configure/page.tsx          # URL configuration UI
│   └── api/
│       └── visual-tests/
│           ├── [...path]/route.ts  # Results API
│           └── generate/route.ts   # Test generator API
├── components/
│   └── visual-testing/
│       ├── Navigation.tsx          # Top navigation bar
│       ├── TestConfiguration.tsx   # URL config form
│       ├── TestResultCard.tsx      # Individual test card
│       ├── TestSummary.tsx         # Stats summary
│       └── BaselineActions.tsx     # Baseline buttons
├── tests/
│   └── visual/
│       ├── baselines/              # ✅ COMMIT (expected screenshots)
│       │   ├── mobile/
│       │   ├── tablet/
│       │   └── desktop/
│       ├── current/                # ❌ IGNORE (latest run)
│       ├── diffs/                  # ❌ IGNORE (difference images)
│       └── baseline-history/       # ✅ OPTIONAL (version history)
├── visual-reports/
│   └── results.json                # Latest test results
├── playwright.visual.config.ts     # Playwright configuration
└── package.json
```

---

## 🎯 Use Cases

### Testing Production Sites

```javascript
// Configure in UI:
Name: Marketing Site - Homepage
URL: https://myapp.com
Viewports: Mobile, Tablet, Desktop
```

Run tests against live production URLs to detect unintended visual changes.

### Testing Staging/Preview Deployments

```javascript
// Test Vercel preview deployments:
Name: Feature Branch Preview
URL: https://myapp-git-feature-branch.vercel.app
Viewports: Mobile, Desktop
```

### Testing Localhost During Development

```javascript
// Test local development:
Name: Local Development Server
URL: http://localhost:3000
Viewports: Mobile, Desktop
```

⚠️ **Important**: Make sure your local server is running before executing tests!

---

## ⚙️ Configuration

### Playwright Configuration

Edit `playwright.visual.config.ts` to customize:

```typescript
export default defineConfig({
  testDir: './tests/visual',
  timeout: 30000,           // Test timeout
  retries: 2,               // Retry failed tests
  workers: 4,               // Parallel workers
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  }
});
```

### Viewport Sizes

Default viewports (defined in `app/api/visual-tests/generate/route.ts`):

```typescript
{
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 }
}
```

Customize by editing the viewport map in the generate route.

### Baseline Retention

Control how many baseline versions to keep (in `app/api/visual-tests/[...path]/route.ts`):

```typescript
const config = {
  maxVersions: 10  // Keep last 10 baseline versions
};
```

---

## 📦 Data Storage

All data is stored **locally in your project directory**:

| Directory | Purpose | Git |
|-----------|---------|-----|
| `tests/visual/baselines/` | Expected screenshots | ✅ Commit |
| `tests/visual/current/` | Latest test run | ❌ Ignore |
| `tests/visual/diffs/` | Visual difference images | ❌ Ignore |
| `tests/visual/baseline-history/` | Previous baseline versions | 🔶 Optional |
| `visual-reports/results.json` | Test execution results | ❌ Ignore |

### Git Workflow

```bash
# After setting baselines:
git add tests/visual/baselines/
git commit -m "Add visual baselines for homepage"

# Share with team:
git push origin main
```

Team members pull the baselines and run tests against the same expected results.

---

## 🔧 Advanced Usage

### Programmatic Test Generation

Instead of using the UI, you can generate tests programmatically:

```bash
POST /api/visual-tests/generate
Content-Type: application/json

{
  "configs": [
    {
      "name": "Homepage",
      "url": "https://example.com",
      "viewports": ["mobile", "desktop"]
    }
  ]
}
```

### Custom Test Files

The generator creates files in `tests/visual/generated-tests.spec.ts`. You can also create custom test files:

```typescript
// tests/visual/custom-test.spec.ts
import { test, expect } from '@playwright/test';

test.describe('mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('custom flow', async ({ page }) => {
    await page.goto('https://example.com');
    await page.click('#login-button');
    await expect(page).toHaveScreenshot('login-modal.png');
  });
});
```

### Accessing Results Programmatically

```bash
GET /api/visual-tests/results
```

Returns JSON with all test results, baseline status, and diff information.

---

## 🎨 UI Components

The viewer includes reusable React components you can extract:

- **TestSummary** - Pass/fail statistics banner
- **TestResultCard** - Individual test with screenshot viewer
- **BaselineActions** - Set/update/view baseline buttons
- **TestConfiguration** - URL configuration form
- **Navigation** - App navigation bar

All components are in `components/visual-testing/` and use Tailwind CSS.

---

## 📚 Additional Documentation

- [**Data Storage Explained**](./DATA_STORAGE_EXPLAINED.md) - Deep dive into file storage
- [**URL-Based Testing Guide**](./URL_BASED_TESTING_GUIDE.md) - Detailed workflow guide
- [**Layout Detection**](./LAYOUT_DETECTION.md) - How viewports work
- [**Vercel Deployment Testing**](./VERCEL_DEPLOYMENT_TESTING.md) - Testing deployed sites

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- Built with [Next.js 16](https://nextjs.org/)
- Powered by [Playwright](https://playwright.dev/)
- Visual diffing via [pixelmatch](https://github.com/mapbox/pixelmatch)

---

## 💡 Tips

**Q: Tests are failing but images look identical**
A: Try setting a higher `threshold` in the `toHaveScreenshot()` call (default: 0.2).

**Q: How do I test authenticated pages?**
A: Add authentication context to Playwright config or use `storageState` option.

**Q: Can I test responsive behavior?**
A: Yes! The system tests each viewport separately, so you can verify mobile vs desktop layouts.

**Q: How do I share baselines with my team?**
A: Commit `tests/visual/baselines/` to Git. When teammates pull and run tests, they use the same baselines.

---

**Made with ❤️ for visual regression testing**
