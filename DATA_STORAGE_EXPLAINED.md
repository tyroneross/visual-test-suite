# Where is Data Saved?

## ✅ **Everything is Saved Locally** (No Cloud)

All visual testing data is stored in **your project's file system**. When users download the SDK, they get a completely **local-first** solution.

---

## 📂 **File Structure**

```
your-project/
├── tests/visual/
│   ├── baselines/              ← Expected screenshots (THE TRUTH)
│   │   ├── Mobile 375×667/
│   │   │   ├── homepage.png
│   │   │   └── market-trends.png
│   │   ├── Tablet 768×1024/
│   │   │   └── homepage.png
│   │   └── Desktop 1920×1080/
│   │       ├── homepage.png
│   │       └── market-trends.png
│   │
│   ├── current/                ← Latest test screenshots
│   │   └── [same structure]
│   │
│   ├── diffs/                  ← Visual difference images
│   │   └── [same structure]
│   │
│   └── baseline-history/       ← Previous baseline versions
│       ├── Mobile 375×667/
│       │   └── homepage/
│       │       ├── metadata.json
│       │       ├── 2025-10-22T10-30-00.png
│       │       ├── 2025-10-22T11-15-00.png
│       │       └── 2025-10-22T12-45-00.png
│       └── Desktop 1920×1080/
│           └── market-trends/
│               ├── metadata.json
│               └── [timestamped versions]
│
├── visual-reports/
│   ├── results.json            ← Test execution results
│   └── html/                   ← Playwright HTML report
│
└── playwright.visual.config.ts ← Configuration
```

---

## 🎯 **What Gets Saved Where**

### **1. Baselines** (`tests/visual/baselines/`)

**What:** The "expected" screenshots that future tests compare against

**When saved:**
- When you click "Set as Baseline" in the viewer
- Manually via `npx playwright test --update-snapshots`

**Size:** ~100-500KB per image (PNG)

**Git committed:** ✅ **YES** - Should be in version control

**Example:**
```
tests/visual/baselines/Desktop 1920×1080/homepage.png
→ This is THE source of truth for what homepage should look like
```

---

### **2. Current Screenshots** (`tests/visual/current/`)

**What:** Screenshots from the most recent test run

**When saved:**
- Every time you run `npm run visual:test`
- Overwritten on each test run

**Size:** ~100-500KB per image

**Git committed:** ❌ **NO** - Temporary, regenerated each run

**Example:**
```
tests/visual/current/Mobile 375×667/homepage.png
→ Latest screenshot from test run, compared against baseline
```

---

### **3. Diff Images** (`tests/visual/diffs/`)

**What:** Visual difference overlays (red highlighting where pixels changed)

**When saved:**
- Only when tests **fail** (visual differences detected)
- Shows exactly what changed

**Size:** ~100-500KB per image

**Git committed:** ❌ **NO** - Temporary failure artifacts

**Example:**
```
tests/visual/diffs/Desktop 1920×1080/homepage-diff.png
→ Red overlay showing changed pixels
```

---

### **4. Baseline History** (`tests/visual/baseline-history/`)

**What:** Archive of previous baselines (last 10 versions by default)

**When saved:**
- Every time you update a baseline
- Old baseline is moved to history before being replaced

**Size:** ~1-5MB total (keeps last 10 versions)

**Git committed:** ⚠️ **OPTIONAL** - Can be useful for rollback

**metadata.json example:**
```json
{
  "versions": [
    {
      "timestamp": "2025-10-22T10:30:00.000Z",
      "filename": "2025-10-22T10-30-00.png",
      "comment": "Replaced by new baseline"
    },
    {
      "timestamp": "2025-10-22T11:15:00.000Z",
      "filename": "2025-10-22T11-15-00.png",
      "comment": "Replaced by new baseline"
    }
  ]
}
```

**Benefits:**
- Rollback to previous baselines if needed
- Audit trail of design changes
- Configurable retention (default: 10 versions)

---

### **5. Test Results** (`visual-reports/results.json`)

**What:** JSON file with test execution metadata

**When saved:**
- Every test run
- Contains pass/fail status, duration, errors

**Size:** ~10-100KB

**Git committed:** ❌ **NO** - Regenerated each run

**Example:**
```json
{
  "stats": {
    "total": 6,
    "passed": 4,
    "failed": 2
  },
  "suites": [
    {
      "title": "Desktop Viewport",
      "specs": [
        {
          "title": "Homepage",
          "status": "passed",
          "duration": 1234
        }
      ]
    }
  ]
}
```

---

## 🔄 **Typical Workflow & Storage**

### **Day 1: Initial Baseline Setup**

```bash
npm run visual:test
```

**Creates:**
```
tests/visual/current/Desktop/homepage.png  (500KB)
tests/visual/current/Desktop/market-trends.png  (450KB)
visual-reports/results.json  (15KB)
```

**Then you click "Set as Baseline":**

```
tests/visual/baselines/Desktop/homepage.png  (500KB)  ← COPIED
tests/visual/baselines/Desktop/market-trends.png  (450KB)  ← COPIED
```

**Git commit:**
```bash
git add tests/visual/baselines/
git commit -m "Add initial visual baselines"
```

---

### **Day 7: Running Tests Again**

```bash
npm run visual:test
```

**Creates:**
```
tests/visual/current/Desktop/homepage.png  (NEW VERSION, 500KB)
tests/visual/current/Desktop/market-trends.png  (NEW VERSION, 455KB)
```

**Playwright compares:**
- current/Desktop/homepage.png vs baselines/Desktop/homepage.png
- **Result:** ✓ Match!

- current/Desktop/market-trends.png vs baselines/Desktop/market-trends.png
- **Result:** ✗ Different! (5KB difference suggests slight change)

**Creates diff image:**
```
tests/visual/diffs/Desktop/market-trends-diff.png  (460KB)
```

**You review, decide change is intentional, click "Set as Baseline":**

**Archive old baseline:**
```
tests/visual/baseline-history/Desktop/market-trends/
  ├── metadata.json
  └── 2025-10-22T10-30-00.png  (OLD baseline moved here)
```

**Update baseline:**
```
tests/visual/baselines/Desktop/market-trends.png  (NEW version, 455KB)
```

**Git commit:**
```bash
git add tests/visual/baselines/Desktop/market-trends.png
git commit -m "Update market trends baseline after chart styling change"
```

---

## 💾 **Storage Requirements**

### **Per Screenshot:**
- Image size: ~100-500KB (depends on page complexity)
- Viewport: 1920×1080 → ~300KB average

### **Example Project (10 pages × 3 viewports):**

| Directory | Files | Total Size |
|-----------|-------|------------|
| baselines/ | 30 images | ~9MB |
| current/ | 30 images | ~9MB |
| diffs/ | ~5 failures | ~1.5MB |
| baseline-history/ | 50 archived | ~15MB |
| visual-reports/ | 1 JSON | ~50KB |
| **TOTAL** | | **~35MB** |

**Git repository:**
- Commit baselines only: ~9MB
- Don't commit current/ or diffs/: Saves ~10MB
- Optional baseline-history/: +15MB (for rollback capability)

---

## 🌐 **Team Collaboration**

### **Everyone Gets Same Baselines**

**Developer A:**
```bash
git clone your-repo
npm install
npm run visual:test
```

**Compares against:**
```
tests/visual/baselines/  ← Downloaded from git repo
```

**Developer B:**
```bash
git pull
npm run visual:test
```

**Uses same baselines** → Consistent results across team!

---

## 🚫 **What is NOT Saved**

❌ No cloud storage
❌ No database
❌ No remote servers
❌ No analytics tracking
❌ No external dependencies

**100% local, 100% private, 100% yours!**

---

## ⚙️ **Configuration**

You can customize storage locations:

```typescript
// app/api/visual-tests/[...path]/route.ts
const api = createVisualTestAPI({
  resultsPath: './visual-reports/results.json',     // Test results
  baselinesPath: './tests/visual/baselines',        // Expected screenshots
  currentPath: './tests/visual/current',            // Latest screenshots
  diffsPath: './tests/visual/diffs',                // Diff images
  maxVersions: 10  // How many old baselines to keep in history
});
```

**Change retention:**
```typescript
maxVersions: 5   // Keep last 5 baseline versions instead of 10
maxVersions: 20  // Keep last 20 versions (more history)
maxVersions: 0   // Disable history (don't archive old baselines)
```

---

## 🔐 **Security & Privacy**

✅ **All data stays on your machine**
✅ **No external API calls for storage**
✅ **No telemetry or tracking**
✅ **Can work completely offline**
✅ **Full control over data retention**

---

## 📦 **When Users Download Your SDK**

If you publish `@your-org/visual-test-backend` to NPM:

**What they download:** Just the code (~50KB)
**What they create locally:** All the files above

**Their project structure:**
```
their-project/
├── node_modules/
│   └── @your-org/visual-test-backend/  ← SDK code only
├── tests/visual/  ← THEY create this
├── visual-reports/  ← THEY create this
└── playwright.visual.config.ts  ← THEY create this
```

**Each user has their own:**
- Own baselines
- Own test results
- Own history
- Own diffs

**Zero shared infrastructure!**

---

## 🎯 **Summary**

| Data Type | Location | Committed to Git | Cloud Storage |
|-----------|----------|------------------|---------------|
| Baselines | `tests/visual/baselines/` | ✅ YES | ❌ NO |
| Current screenshots | `tests/visual/current/` | ❌ NO | ❌ NO |
| Diff images | `tests/visual/diffs/` | ❌ NO | ❌ NO |
| Baseline history | `tests/visual/baseline-history/` | ⚠️ OPTIONAL | ❌ NO |
| Test results JSON | `visual-reports/results.json` | ❌ NO | ❌ NO |

**Everything is local. Everything is yours. No surprises!** 🎉
