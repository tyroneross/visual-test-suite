# URL-Based Visual Testing Guide

## 🎯 **Why URL-Based Configuration?**

Instead of manually writing Playwright test files, you can now:
- **Configure tests via UI** - No code required!
- **Point to URLs** - Test any deployed page
- **Auto-generate test files** - Playwright tests created automatically
- **Set baselines via UI** - Works seamlessly with URL-based tests

---

## 📋 **Complete Workflow**

### **Step 1: Configure Tests via UI**

1. Open http://localhost:3100/configure
2. Fill in the form:
   - **Test Name**: "Homepage" (friendly name)
   - **URL**: http://localhost:3000 (your app URL)
   - **Viewports**: Check Mobile, Tablet, Desktop
   - **Full Page**: Leave checked to capture entire page
3. Click **"Add to Test Suite"**
4. Repeat for other pages:
   - "Market Trends" → http://localhost:3000/markettrends
   - "News Feed" → http://localhost:3000/
   - "Executive Summary" → http://localhost:3000/executive

5. Click **"Generate Tests"** button

---

### **Step 2: What Happens Behind the Scenes**

The system automatically creates:

#### **File 1: `tests/visual/auto-generated.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('Homepage', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Market Trends', async ({ page }) => {
    await page.goto('http://localhost:3000/markettrends');
    await expect(page).toHaveScreenshot('market-trends.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});

test.describe('Desktop Viewport (1920×1080)', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  // Same tests at desktop size...
});
```

#### **File 2: `playwright.visual.config.ts`**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  projects: [
    { name: 'Mobile 375×667', use: { viewport: { width: 375, height: 667 } } },
    { name: 'Tablet 768×1024', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'Desktop 1920×1080', use: { viewport: { width: 1920, height: 1080 } } }
  ],
  reporter: [
    ['json', { outputFile: 'visual-reports/results.json' }]
  ]
});
```

---

### **Step 3: Run Tests**

```bash
# In your terminal
npm run visual:test
```

This executes Playwright tests which:
1. Navigate to each URL
2. Capture screenshots at each viewport size
3. Save results to `visual-reports/results.json`
4. Save screenshots to:
   - `tests/visual/current/` (new screenshots)
   - `tests/visual/diffs/` (if baselines exist)

---

### **Step 4: View Results**

1. Go to http://localhost:3100 (main viewer)
2. You'll see all tests grouped by viewport:

```
┌─────────────────────────────┐
│ ✓ Homepage                  │
│ Mobile 375×667              │
│ Duration: 1.2s              │
│ [Baseline] [History]        │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ✓ Market Trends             │
│ Desktop 1920×1080           │
│ Duration: 0.8s              │
│ [Baseline] [History]        │
└─────────────────────────────┘
```

---

### **Step 5: Set Baselines (First Time)**

**CRITICAL:** This is how URL-based testing connects to baselines!

1. Click **"Set as Baseline"** on each test
2. This copies screenshots from `tests/visual/current/` to `tests/visual/baselines/`
3. Baselines are now your "expected" screenshots

**What happens:**
```bash
# Before setting baseline
tests/visual/
├── current/
│   ├── Mobile 375×667/
│   │   └── homepage.png       ← New screenshot
│   └── Desktop 1920×1080/
│       └── homepage.png
└── baselines/                  ← Empty

# After clicking "Set as Baseline"
tests/visual/
├── current/
│   └── [same as above]
├── baselines/
│   ├── Mobile 375×667/
│   │   └── homepage.png       ← Baseline saved!
│   └── Desktop 1920×1080/
│       └── homepage.png
└── baseline-history/          ← Previous versions archived
    └── Mobile 375×667/
        └── homepage/
            ├── metadata.json
            └── 2025-10-22T10-30-00.png
```

---

### **Step 6: Future Tests (Automatic Comparison)**

Next time you run `npm run visual:test`:

1. Playwright captures new screenshots → `tests/visual/current/`
2. Compares against baselines → `tests/visual/baselines/`
3. If different, generates diff image → `tests/visual/diffs/`
4. Updates `visual-reports/results.json` with status:
   - ✓ **Passed** - Matches baseline
   - ✗ **Failed** - Visual differences detected

5. Viewer shows side-by-side comparison:
   - Baseline (expected)
   - Current (actual)
   - Diff (highlighted differences)

---

## 🔄 **How Baselines Stay In Sync**

### **When You Update Your App**

Scenario: You intentionally changed the homepage design.

1. Run tests → They **fail** (design changed)
2. View results → See the new design
3. Click **"Set as Baseline"** → Accept new design as expected
4. Future tests → Now compare against NEW baseline

### **When Multiple People Work on Same App**

Baselines are stored in `tests/visual/baselines/` directory:

```bash
# Commit baselines to git
git add tests/visual/baselines/
git commit -m "Update baselines after design refresh"
git push
```

Everyone on your team gets the same baselines when they pull!

---

## 🎨 **Advanced: Testing Specific Components**

You can test component-specific URLs too:

### **Example: Storybook Components**

```
Test Name: Button Component - Primary
URL: http://localhost:6006/iframe.html?id=button--primary
Viewports: Mobile, Desktop
```

### **Example: Specific UI States**

```
Test Name: Dashboard - Loading State
URL: http://localhost:3000/dashboard?mockState=loading
Viewports: Desktop
```

The URL-based approach works with ANY URL, including:
- Local development (localhost:3000)
- Staging environments (staging.yourapp.com)
- Component libraries (Storybook)
- Different branches (feature-branch.vercel.app)

---

## 💡 **Key Insights**

**★ Insight ─────────────────────────────────────**

### **1. URL-Based ≠ No Baselines**

URL-based configuration just changes HOW you define tests, not how baselines work:

- **Manual Playwright files**: You write test code → captures screenshots → set baselines
- **URL-based generation**: UI generates test code → captures screenshots → set baselines

**Both approaches use the exact same baseline system!**

### **2. Baselines Are Persistent**

Once set, baselines persist:
- Across server restarts ✓
- Across deployments ✓
- For all team members (via git) ✓
- Until you update them ✓

### **3. One Source of Truth**

The `tests/visual/baselines/` directory is the **single source of truth**.
All tests (manual or URL-based) compare against these files.

**─────────────────────────────────────────────────**

---

## 🚀 **Real-World Example: Atomize-News**

Let's configure atomize-news pages:

### **Configuration Input:**

| Test Name | URL | Viewports |
|-----------|-----|-----------|
| Homepage | http://localhost:3000 | Mobile, Tablet, Desktop |
| Market Trends | http://localhost:3000/markettrends | Desktop |
| AI Trends | http://localhost:3000/aitrends | Desktop |
| Executive Dashboard | http://localhost:3000/executive | Tablet, Desktop |

### **After "Generate Tests":**

This creates ONE Playwright test file with 8 total tests:
- Homepage: 3 tests (Mobile, Tablet, Desktop)
- Market Trends: 1 test (Desktop)
- AI Trends: 1 test (Desktop)
- Executive Dashboard: 2 tests (Tablet, Desktop)

### **After Running Tests:**

You get 8 screenshot sets in the viewer, grouped by viewport and page.

### **After Setting Baselines:**

All 8 screenshots are saved as baselines. Next run automatically compares against them.

---

## 🎯 **Summary**

✅ **Configure via URL** - No manual Playwright coding
✅ **Auto-generate tests** - Click button, get test files
✅ **Run tests** - Standard `npm run visual:test`
✅ **Set baselines** - Click "Set as Baseline" in viewer
✅ **Future tests** - Automatically compare vs baselines
✅ **Update baselines** - Click button when design changes

**The URL-based approach makes visual testing accessible to non-developers while maintaining the same robust baseline system!** 🎉

---

## 📚 **Next Steps**

1. **Try it now:** http://localhost:3100/configure
2. **Add your first URL:** Point to any page in atomize-news
3. **Generate tests:** Click the button
4. **Run tests:** `npm run visual:test`
5. **Set baselines:** Click "Set as Baseline" on each test
6. **Make a change:** Update CSS, run tests again, see diffs!

The system handles all the complexity - you just provide URLs and approve baselines! 🚀
