# How the Viewer Detects Different Layouts

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  YOUR APP (Any Type)                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Mobile    │  │  Tablet    │  │  Desktop   │            │
│  │  375x667   │  │  768x1024  │  │  1920x1080 │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         │               │               │                    │
│         └───────────────┴───────────────┘                    │
│                         │                                    │
│                         ↓                                    │
│              ┌────────────────────┐                         │
│              │ Playwright Tests   │                         │
│              │ You write these!   │                         │
│              └────────────────────┘                         │
│                         │                                    │
│         ┌───────────────┼───────────────┐                   │
│         ↓               ↓               ↓                    │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐              │
│   │Screenshot│   │Screenshot│   │Screenshot│              │
│   │ Mobile   │   │ Tablet   │   │ Desktop  │              │
│   └──────────┘   └──────────┘   └──────────┘              │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓
         ┌───────────────────────────────┐
         │  Playwright Comparison Engine  │
         │  (Built-in pixel comparison)   │
         └───────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ↓               ↓               ↓
    ┌────────┐     ┌─────────┐    ┌─────────┐
    │ Match  │     │  Diff   │    │ results │
    │  ✓     │     │   ✗     │    │  .json  │
    └────────┘     └─────────┘    └─────────┘
                         │
                         ↓
         ┌───────────────────────────────┐
         │  STANDALONE VIEWER (Port 3100)│
         │                                │
         │  Reads results.json            │
         │  Displays all viewports        │
         │  Groups by device type         │
         │  Shows diffs visually          │
         └───────────────────────────────┘
```

## Concrete Example: Atomize-News

Let's say your news app has different layouts for different screens:

### Mobile (375px)
```
┌─────────────────┐
│    [Header]     │
├─────────────────┤
│  [News Card 1]  │
├─────────────────┤
│  [News Card 2]  │
├─────────────────┤
│  [News Card 3]  │
└─────────────────┘
```

### Tablet (768px)
```
┌─────────────────────────────────┐
│         [Header]                 │
├────────────────┬────────────────┤
│ [News Card 1]  │ [News Card 2]  │
├────────────────┼────────────────┤
│ [News Card 3]  │ [News Card 4]  │
└────────────────┴────────────────┘
```

### Desktop (1920px)
```
┌────────────────────────────────────────────────────────┐
│                    [Header]                             │
├──────────┬──────────────┬──────────────┬──────────────┤
│ Sidebar  │ [Card 1]     │ [Card 2]     │ [Card 3]     │
│ [Trends] ├──────────────┼──────────────┼──────────────┤
│ [Topics] │ [Card 4]     │ [Card 5]     │ [Card 6]     │
└──────────┴──────────────┴──────────────┴──────────────┘
```

## How Playwright Captures This

```typescript
// playwright.visual.config.ts
export default defineConfig({
  projects: [
    {
      name: 'Mobile iPhone 13',
      use: {
        ...devices['iPhone 13'],  // 390x844
      }
    },
    {
      name: 'Tablet iPad',
      use: {
        ...devices['iPad Pro'],    // 1024x1366
      }
    },
    {
      name: 'Desktop Chrome',
      use: {
        viewport: { width: 1920, height: 1080 }
      }
    }
  ]
});

// tests/visual/homepage.spec.ts
test('Homepage layout', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  
  // Playwright automatically uses the viewport from config
  // Takes screenshot at current viewport size
  await expect(page).toHaveScreenshot('homepage.png');
});
```

When you run `npm run visual:test`, Playwright:
1. Runs test 3 times (once per project)
2. Each run uses different viewport
3. Saves 3 separate screenshots:
   - `Mobile iPhone 13/homepage.png`
   - `Tablet iPad/homepage.png`
   - `Desktop Chrome/homepage.png`

## Viewer Displays All Three

The viewer groups them automatically:

```
Visual Regression Testing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary: 3 tests, 0 passed, 0 failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────┐
│ ✓ Homepage layout           │
│ Mobile iPhone 13            │
│ 390×844                     │
│ [View Screenshots]          │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ✓ Homepage layout           │
│ Tablet iPad                 │
│ 1024×1366                   │
│ [View Screenshots]          │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ✓ Homepage layout           │
│ Desktop Chrome              │
│ 1920×1080                   │
│ [View Screenshots]          │
└─────────────────────────────┘
```

## Key Insight: You Control Everything

The viewer doesn't "detect" layouts automatically. **You define**:

1. **Which pages to test** → In your test files
2. **Which viewports** → In Playwright config
3. **What to capture** → Screenshot selectors
4. **What to ignore** → Dynamic elements to mask

The viewer just displays the results beautifully!

---

## Advanced: Component-Level Testing

You can also test individual components across layouts:

```typescript
// tests/visual/button-component.spec.ts
test.describe('Button Component - All States', () => {
  
  test('Primary button', async ({ page }) => {
    await page.goto('http://localhost:3000/components/button');
    
    const button = page.locator('[data-testid="button-primary"]');
    
    // Capture just the button (not full page)
    await expect(button).toHaveScreenshot('button-primary.png');
  });
  
  test('Button hover state', async ({ page }) => {
    await page.goto('http://localhost:3000/components/button');
    
    const button = page.locator('[data-testid="button-primary"]');
    await button.hover();
    
    await expect(button).toHaveScreenshot('button-hover.png');
  });
});
```

This creates pixel-perfect component snapshots that work across any viewport!

---

## Supported App Types

✅ **News Sites** (like atomize-news)  
✅ **E-commerce** (product grids, checkout flows)  
✅ **Dashboards** (charts, tables, widgets)  
✅ **Documentation** (sidebar navigation)  
✅ **Marketing Pages** (hero sections, CTAs)  
✅ **Admin Panels** (forms, data tables)  
✅ **Social Media** (feeds, profiles)  
✅ **SaaS Products** (complex UIs)

The viewer works with ALL of them because it's just a presentation layer for Playwright test results!
