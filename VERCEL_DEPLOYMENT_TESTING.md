# Testing Your Vercel Deployment

You tested `https://atomize-news.vercel.app/` - here's how to complete the workflow:

## 📋 **Step-by-Step Guide**

### **Step 1: Configure Test (DONE ✓)**

You already did this! You entered:
- Test Name: "NEW"
- URL: https://atomize-news.vercel.app/
- Viewport: Desktop

### **Step 2: Add to Test Suite**

Click the blue **"Add to Test Suite"** button at the bottom of the form.

You should see a new card appear showing:
```
NEW
https://atomize-news.vercel.app/
Viewports: Desktop
```

### **Step 3: Generate Tests**

Click the green **"Generate Tests"** button.

This creates:
- `tests/visual/auto-generated.spec.ts` (Playwright test file)
- `playwright.visual.config.ts` (Configuration)

You'll see a success message: "Generated 1 test file(s). Run 'npm run visual:test' to execute."

### **Step 4: Run Tests in Terminal**

**THIS IS THE STEP YOU MISSED!**

Open your terminal and run:

```bash
cd "/Users/tyroneross/Desktop/Git Folder/atomize-news/visual-viewer-test"
npm run visual:test
```

This will:
1. Launch Playwright
2. Navigate to https://atomize-news.vercel.app/
3. Capture a screenshot at Desktop viewport (1920×1080)
4. Save to `tests/visual/current/Desktop 1920×1080/new.png`
5. Update `visual-reports/results.json`

**You'll see output like:**
```
Running 1 test using 1 worker
  1 passed (3.2s)

To open last HTML report run:
  npx playwright show-report visual-reports/html
```

### **Step 5: View Results**

**NOW** go to http://localhost:3100 (Test Results tab)

You'll see:
```
┌─────────────────────────────┐
│ ✓ NEW                       │
│ Desktop 1920×1080           │
│ Duration: 1.8s              │
│ [Set as Baseline] [History] │
└─────────────────────────────┘
```

Click the test card to expand and see the screenshot of your Vercel deployment!

### **Step 6: Set Baseline**

Click **"Set as Baseline"** button.

This saves the screenshot as your expected result. Future tests will compare against this baseline.

---

## 🎯 **Why You Didn't See Results**

The workflow is:

```
Configure URL → Generate Tests → RUN TESTS IN TERMINAL → See Results
                                         ↑
                                   YOU SKIPPED THIS!
```

The viewer **doesn't run tests automatically**. It only displays results from tests you've already run via `npm run visual:test`.

---

## 🚀 **Testing More Pages**

Want to test other pages from your Vercel deployment? Add more:

### **Market Trends Page**
```
Test Name: Market Trends
URL: https://atomize-news.vercel.app/markettrends
Viewports: Desktop
```

### **AI Trends Page**
```
Test Name: AI Trends
URL: https://atomize-news.vercel.app/aitrends
Viewports: Desktop
```

### **Mobile Homepage**
```
Test Name: Homepage Mobile
URL: https://atomize-news.vercel.app/
Viewports: Mobile
```

Then:
1. Click "Add to Test Suite" for each
2. Click "Generate Tests" once
3. Run `npm run visual:test` (captures all pages)
4. View results tab

---

## 💡 **Pro Tips**

### **Testing Multiple Viewports**

Check Mobile, Tablet, AND Desktop for the same URL:

```
Test Name: Homepage All Devices
URL: https://atomize-news.vercel.app/
Viewports: ✓ Mobile ✓ Tablet ✓ Desktop
```

This creates 3 tests automatically:
- Mobile 375×667
- Tablet 768×1024
- Desktop 1920×1080

### **Testing Dynamic Content**

If your page has dynamic timestamps or changing content, use the "Wait for selector" field:

```
Test Name: News Feed
URL: https://atomize-news.vercel.app/
Wait for selector: [data-testid="news-card"]
```

This ensures Playwright waits for content to load before capturing.

### **Testing Behind Auth**

If you need to test authenticated pages, you'll need to manually modify the generated test file:

```typescript
// tests/visual/auto-generated.spec.ts
test('Dashboard', async ({ page, context }) => {
  // Login first
  await context.addCookies([{
    name: 'session',
    value: 'your-session-token',
    domain: 'atomize-news.vercel.app',
    path: '/'
  }]);

  await page.goto('https://atomize-news.vercel.app/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

---

## 🔄 **Continuous Testing**

Once baselines are set, run this before every deployment:

```bash
npm run visual:test
```

If any visual changes are detected:
- Tests fail
- Diff images show exactly what changed
- Review in viewer
- Update baseline if change is intentional

This prevents accidental visual regressions in production!

---

## 📊 **Summary**

✅ **You tested:** https://atomize-news.vercel.app/
❌ **You missed:** Running `npm run visual:test` in terminal
✅ **Next step:** Run the command, then check Test Results tab

The viewer is a **result display tool**, not a test runner. Think of it as a dashboard for Playwright test results.
