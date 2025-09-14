import chalk from "chalk";
import ora from "ora";
import { writeFileSync } from "node:fs";
import { parseDelegate } from "../parsers/delegate";
import { autodetectLockFile } from "./autodetectLockFile";
import { fetchPackageInfo } from "./fetchPackageInfo";

export async function analyzePackageFile({
  lockFilePath,
  outputPath,
}: {
  lockFilePath: string | null;
  outputPath: string | null;
}) {
  try {

    const filePath = lockFilePath ?? autodetectLockFile(process.cwd());
    if (!filePath) {
      throw new Error('Could not find a supported lock file in the current directory');
    }

    let packagesToAnalyze = parseDelegate(filePath);

    const spinner = ora(`Analyzing package updates (${packagesToAnalyze.length})`).start();
    let packagesFetched = 0;

    const packageInfos = await Promise.all(
      packagesToAnalyze.map(async ({ name, version }) => {
        const info = await fetchPackageInfo(name, version);
        packagesFetched++;
        spinner.text = `Analyzing package updates (${packagesFetched}/${packagesToAnalyze.length})`;
        return info
      })
    );

    spinner.stop();

    console.log('\nPackage Update Analysis:');
    console.log('========================\n');

    packageInfos
      .sort((a, b) => {
        // Then sort all items that have no current version to the end
        if (a.next == null) {
          return 1;
        }

        if (b.next == null) {
          return -1;
        }

        // Then sort based on diff between next and current time
        const aDiff = a.next.publishDate.getTime() - Date.now();
        const bDiff = b.next.publishDate.getTime() - Date.now();

        return aDiff - bDiff;

      })
      .forEach(pkg => {
        const pkgTag = chalk.blue(`${pkg.name}@${pkg.current.version}`)
        if (pkg.next == null) {
          console.log(`${pkgTag}: ${chalk.green('Up to date')}`);
          return;
        }

        const msSinceUpdate = Date.now() - pkg.next.publishDate.getTime();
        const daysSinceUpdate = Math.floor(msSinceUpdate / (1000 * 60 * 60 * 24));
        const timeAgo = daysSinceUpdate === 1 ? '1 day ago' : `${daysSinceUpdate} days ago`;

        console.log(`${pkgTag}: Last updated ${chalk.red(timeAgo)}${pkg.next ? ` (${pkg.next.version})` : ''}`);
      });

    if (outputPath) {
      writeFileSync(outputPath, JSON.stringify(packageInfos, null, 2));
    }

  } catch (error) {
    console.error('Error analyzing packages:', error);
  }
}
