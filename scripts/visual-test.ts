#!/usr/bin/env tsx

/**
 * Visual regression testing script
 * Provides commands for baseline management and test execution
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import chalk from 'chalk';
import { VisualComparator } from '../lib/visual-testing/visual-comparator';

// Directory paths
const BASELINES_DIR = 'tests/visual/baselines';
const CURRENT_DIR = 'tests/visual/current';
const DIFFS_DIR = 'tests/visual/diffs';
const REPORTS_DIR = 'visual-reports';

// Ensure directories exist
function ensureDirectories() {
  [BASELINES_DIR, CURRENT_DIR, DIFFS_DIR, REPORTS_DIR].forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
  });
}

// Clean temporary files
function cleanTempFiles() {
  console.log(chalk.blue('Cleaning temporary files...'));
  [CURRENT_DIR, DIFFS_DIR].forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Run visual tests
async function runTests(options: { update?: boolean; clean?: boolean; project?: string }) {
  ensureDirectories();

  if (options.clean) {
    cleanTempFiles();
  }

  console.log(chalk.blue('\n🎨 Running visual regression tests...\n'));

  try {
    // Build playwright command
    let command = 'npx playwright test --config=playwright.visual.config.ts';

    if (options.project) {
      command += ` --project="${options.project}"`;
    }

    if (options.update) {
      process.env.UPDATE_BASELINES = 'true';
    }

    // Execute tests
    execSync(command, {
      stdio: 'inherit',
      env: { ...process.env }
    });

    console.log(chalk.green('\n✅ Visual tests completed successfully!\n'));
  } catch (error) {
    console.error(chalk.red('\n❌ Visual tests failed!\n'));
    process.exit(1);
  }
}

// Update baselines
async function updateBaselines(options: { force?: boolean }) {
  console.log(chalk.blue('\n📸 Updating baselines...\n'));

  const comparator = new VisualComparator();

  // Find all current screenshots
  const currentFiles = getAllFiles(CURRENT_DIR, '.png');

  if (currentFiles.length === 0) {
    console.log(chalk.yellow('No current screenshots found. Run tests first.'));
    return;
  }

  let updatedCount = 0;
  let skippedCount = 0;

  for (const currentFile of currentFiles) {
    const relativePath = path.relative(CURRENT_DIR, currentFile);
    const baselinePath = path.join(BASELINES_DIR, relativePath);

    if (!options.force && fs.existsSync(baselinePath)) {
      console.log(chalk.gray(`  Skipping existing: ${relativePath}`));
      skippedCount++;
      continue;
    }

    console.log(chalk.green(`  Updating: ${relativePath}`));
    comparator.createBaseline(currentFile, baselinePath);
    updatedCount++;
  }

  console.log(chalk.green(`\n✅ Updated ${updatedCount} baselines`));
  if (skippedCount > 0) {
    console.log(chalk.gray(`   Skipped ${skippedCount} existing baselines (use --force to overwrite)`));
  }
}

// Compare screenshots
async function compareScreenshots() {
  console.log(chalk.blue('\n🔍 Comparing screenshots...\n'));

  const comparator = new VisualComparator({
    threshold: 0.1,
    generateDiff: true,
    failOnMissingBaseline: false
  });

  // Find all current screenshots
  const currentFiles = getAllFiles(CURRENT_DIR, '.png');

  if (currentFiles.length === 0) {
    console.log(chalk.yellow('No current screenshots found. Run tests first.'));
    return;
  }

  const results = [];

  for (const currentFile of currentFiles) {
    const relativePath = path.relative(CURRENT_DIR, currentFile);
    const baselinePath = path.join(BASELINES_DIR, relativePath);
    const testName = path.basename(currentFile, '.png');

    const result = await comparator.compare(testName, baselinePath, currentFile);
    results.push(result);

    // Display result
    if (result.passed) {
      console.log(chalk.green(`  ✅ ${testName}: PASSED`));
    } else if (result.error?.includes('New baseline created')) {
      console.log(chalk.yellow(`  🆕 ${testName}: New baseline created`));
    } else {
      console.log(chalk.red(`  ❌ ${testName}: FAILED`));
      console.log(chalk.gray(`     Difference: ${result.percentageDifferent?.toFixed(4)}%`));
      if (result.error) {
        console.log(chalk.gray(`     Error: ${result.error}`));
      }
    }
  }

  // Generate summary
  const summary = comparator.generateSummary(results);

  console.log(chalk.blue('\n📊 Summary:'));
  console.log(`  Total tests: ${summary.total}`);
  console.log(chalk.green(`  Passed: ${summary.passed}`));
  console.log(chalk.red(`  Failed: ${summary.failed}`));
  console.log(chalk.yellow(`  New baselines: ${summary.new}`));

  if (summary.failedTests.length > 0) {
    console.log(chalk.red('\n❌ Failed tests:'));
    summary.failedTests.forEach(test => {
      console.log(chalk.red(`  - ${test}`));
    });
  }

  // Save results to JSON
  const resultsPath = path.join(REPORTS_DIR, 'results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({ summary, results }, null, 2));
  console.log(chalk.gray(`\nDetailed results saved to: ${resultsPath}`));

  return summary.failed === 0;
}

// Helper to recursively find files
function getAllFiles(dirPath: string, extension: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dirPath)) {
    return files;
  }

  function traverse(currentPath: string) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        traverse(itemPath);
      } else if (itemPath.endsWith(extension)) {
        files.push(itemPath);
      }
    }
  }

  traverse(dirPath);
  return files;
}

// List all baselines
function listBaselines() {
  console.log(chalk.blue('\n📁 Current baselines:\n'));

  const baselines = getAllFiles(BASELINES_DIR, '.png');

  if (baselines.length === 0) {
    console.log(chalk.yellow('No baselines found.'));
    return;
  }

  const grouped: Record<string, string[]> = {};

  baselines.forEach(baseline => {
    const relativePath = path.relative(BASELINES_DIR, baseline);
    const parts = relativePath.split(path.sep);
    const viewport = parts[0] || 'unknown';

    if (!grouped[viewport]) {
      grouped[viewport] = [];
    }

    grouped[viewport].push(path.basename(baseline));
  });

  Object.entries(grouped).forEach(([viewport, files]) => {
    console.log(chalk.cyan(`\n${viewport}:`));
    files.forEach(file => {
      console.log(`  - ${file}`);
    });
  });

  console.log(chalk.gray(`\nTotal: ${baselines.length} baselines`));
}

// CLI setup
program
  .name('visual-test')
  .description('Visual regression testing utilities')
  .version('0.1.0');

program
  .command('test')
  .description('Run visual regression tests')
  .option('-u, --update', 'Update baselines with current screenshots')
  .option('-c, --clean', 'Clean temporary files before running')
  .option('-p, --project <name>', 'Run specific project (Desktop Chrome, Mobile Chrome, Tablet)')
  .action(runTests);

program
  .command('update')
  .description('Update baseline images from current screenshots')
  .option('-f, --force', 'Overwrite existing baselines')
  .action(updateBaselines);

program
  .command('compare')
  .description('Compare current screenshots with baselines')
  .action(async () => {
    const success = await compareScreenshots();
    process.exit(success ? 0 : 1);
  });

program
  .command('list')
  .description('List all baseline images')
  .action(listBaselines);

program
  .command('clean')
  .description('Clean temporary files and reports')
  .action(() => {
    cleanTempFiles();
    console.log(chalk.green('✅ Cleaned temporary files'));
  });

// Parse CLI arguments
program.parse(process.argv);