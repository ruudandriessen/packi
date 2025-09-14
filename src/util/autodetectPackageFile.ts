import { resolve, dirname } from "node:path";
import fs from "node:fs";

export function autodetectPackageFile(startDir?: string): string | null {
    let currentDir = startDir || process.cwd();

    while (currentDir !== dirname(currentDir)) {
        const packageJsonPath = resolve(currentDir, "package.json");

        if (fs.existsSync(packageJsonPath)) {
            return packageJsonPath;
        }

        currentDir = dirname(currentDir);
    }

    return null;
}
