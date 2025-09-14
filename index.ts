#!/usr/bin/env node
import { Command } from 'commander';
import { resolve } from 'path';
import { analyzePackageFile } from './util/analyzePackageFile';

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
    await analyzePackageFile({ lockFilePath, outputPath });
  });

program.parse();