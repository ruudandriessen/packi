#!/usr/bin/env node
import { Command } from 'commander';
import { resolve } from 'path';
import ora from 'ora';
import { writeFileSync } from 'fs';
import chalk from 'chalk';
import { parseDelegate } from './parsers/delegate.js';
import { autodetectLockFile } from './util/autodetectLockFile.js';

interface PackageInfo {
  name: string;
  current: {
    version: string;
    publishDate: Date;
  };
  next?: {
    version: string;
    publishDate: Date;
  };
}

interface NpmRegistryResponse {
  versions: Record<string, any>;
  time: Record<string, string>;
}

async function fetchPackageInfo(packageName: string, currentVersion: string): Promise<PackageInfo> {
  const response = await fetch(`https://registry.npmjs.org/${packageName}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch package info for ${packageName}`);
  }

  const data = await response.json() as NpmRegistryResponse;
  const versions = Object.keys(data.versions)
    .filter(version => !version.includes('-'))
    .sort((a, b) => {
      const packageATime = data.time[a];
      const packageBTime = data.time[b];

      if (packageATime === undefined || packageBTime === undefined) {
        throw new Error('No time found for package');
      }

      return new Date(packageATime).getTime() - new Date(packageBTime).getTime();
    })


  const currentVersionIndex = versions.indexOf(currentVersion);
  const currentVersionPublishDate = data.time[currentVersion];
  if (currentVersionPublishDate == null) {
    throw new Error('Current version not found in time data');
  }

  if (currentVersionIndex == -1) {
    console.log(versions, currentVersion)
    throw new Error('Current version not found in package versions');
  }

  const nextVersion = versions[currentVersionIndex + 1];

  const current = {
    version: currentVersion,
    publishDate: new Date(currentVersionPublishDate)
  }

  if (nextVersion === undefined) {
    return {
      name: packageName,
      current,
    };
  }


  const nextPublishDate = data.time[nextVersion];
  if (nextPublishDate == null) {
    throw new Error('Next version not found in time data');
  }

  const next = {
    version: nextVersion,
    publishDate: new Date(nextPublishDate)
  };

  return {
    name: packageName,
    current,
    next,
  };
}



async function analyzePackages({
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

    const packageInfos: PackageInfo[] = await Promise.all(
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

const program = new Command();
program
  .name('roest')
  .description('CLI tool to check how long ago each package in package.json was last updated')
  .version('1.0.0');

program
  .command('check')
  .description('Check package update status')
  .option('-f, --file <path>', 'Path to your lock file')
  .option('-o, --output <path>', 'Output file path', './output.json')
  .action(async (options) => {
    const lockFilePath = options.file ? resolve(options.file) : null;
    const outputPath = options.output ? resolve(options.output) : null;
    await analyzePackages({ lockFilePath, outputPath });
  });

program.parse();