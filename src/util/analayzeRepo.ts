import chalk from "chalk";
import ora from "ora";
import { findLockFilesFromRepo } from "../github/findLockFilesFromRepo";
import { analyzePackageFile } from "./analyzePackageFile";

export async function analyzeRepo({
    repositoryPath,
    outputPath,
}: {
    repositoryPath: string;
    outputPath: string | null;
}) {
    const [owner, repo] = repositoryPath.split("/");

    if (!owner || !repo) {
        throw new Error("Invalid repo format use format <owner>/<repository>");
    }

    const loading = ora(
        `Loading lock files from ${chalk.blue(`${owner}/${repo}`)}`,
    ).start();

    const files = await findLockFilesFromRepo({ repo, owner: owner });

    if (files.length === 0) {
        loading.fail(
            `No lock files found in ${chalk.blue(`${owner}/${repo}`)}`,
        );
        return;
    }

    loading.succeed(`Found ${files.length} lock file(s)\n`);

    files.forEach((file) => {
        analyzePackageFile({
            outputPath,
            lockFileContent: file.content,
            lockFilePath: file.path,
        });
    });
}
