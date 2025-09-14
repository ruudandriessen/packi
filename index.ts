#!/usr/bin/env node
import { resolve } from "node:path";
import { Command } from "commander";
import { analyzeRepo } from "./src/util/analayzeRepo";
import { analyzePackageFile } from "./src/util/analyzePackageFile";
import { autodetectLockFile } from "./src/util/autodetectLockFile";

const program = new Command();
program
    .name("roest")
    .description(
        "CLI tool to check how long ago each package in package.json was last updated",
    )
    .version("1.0.0");

program
    .command("check")
    .description("Check package update status")
    .option("-f, --file <path>", "Path to your lock file")
    .option("-o, --output <path>", "Output file path", "./output.json")
    .action(async (options) => {
        const lockFilePath = options.file ? resolve(options.file) : null;
        const outputPath = options.output ? resolve(options.output) : null;

        const filePath = lockFilePath ?? autodetectLockFile(process.cwd());
        if (!filePath) {
            throw new Error(
                "Could not find a supported lock file in the current directory",
            );
        }
        const lockFileContent = readFileSync(filePath, "utf-8");

        await analyzePackageFile({
            lockFilePath: filePath,
            lockFileContent,
            outputPath,
        });
    });

program
    .command("repo")
    .description("Analyze all packages in a repo")
    .argument("<repo>", "Github repo to analyze in format <owner>/<repository>")
    .option("-o, --output <path>", "Output file path", "./output.json")
    .action(async (repositoryPath, options) => {
        const outputPath = options.output ? resolve(options.output) : null;
        await analyzeRepo({ repositoryPath, outputPath });
    });

program.parse();
