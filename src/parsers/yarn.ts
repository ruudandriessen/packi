import { readFileSync } from "node:fs";
import type { Package } from "../models/Package";

interface PackageJson {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}

function isPackageLine(line: string): {
    isPackage: boolean;
    packageName: string;
} {
    const trimmed = line.trim();

    // format example: "@biomejs/biome@2.2.4":
    if (trimmed.startsWith('"') && trimmed.endsWith('":')) {
        return { isPackage: true, packageName: trimmed.slice(1, -2) };
    }

    // format example: ansi-regex@^6.0.1:
    if (trimmed.includes("@") && trimmed.endsWith(":")) {
        return { isPackage: true, packageName: trimmed.slice(0, -1) };
    }

    return { isPackage: false, packageName: "" };
}

function extractPackageName(packageName: string): string {
    const nameMatch = packageName.match(/^(.+?)@/);

    if (!nameMatch || nameMatch[1] === undefined) {
        throw new Error("Name match is undefined");
    }

    return nameMatch ? nameMatch[1] : packageName;
}

function findVersionInNextLines(
    lines: string[],
    startIndex: number,
): string | null {
    for (
        let i = startIndex + 1;
        i < Math.min(startIndex + 10, lines.length);
        i++
    ) {
        const nextLine = lines[i]?.trim();

        if (!nextLine) {
            return null;
        }

        if (nextLine.startsWith('version "') && nextLine.endsWith('"')) {
            return nextLine.slice(9, -1); // remove 'version "' and '"'
        }
    }

    return null;
}

export function parseYarnLock(lockPath: string): Package[] {
    try {
        const lockContent = readFileSync(lockPath, "utf-8");
        const packageJsonPath = lockPath.replace("yarn.lock", "package.json");
        const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
        const packageJson = JSON.parse(packageJsonContent) as PackageJson;

        const declaredPackages = [
            ...Object.keys(packageJson.dependencies ?? {}),
            ...Object.keys(packageJson.devDependencies ?? {}),
        ];

        const packages: Package[] = [];
        const lines = lockContent.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line === undefined) {
                throw new Error("Line is undefined");
            }

            const { isPackage, packageName } = isPackageLine(line);

            if (!isPackage) {
                continue;
            }

            const name = extractPackageName(packageName);

            if (!declaredPackages.includes(name)) {
                continue;
            }

            const version = findVersionInNextLines(lines, i);

            if (version) {
                packages.push({ name, version, registry: "npm" as const });
            }
        }

        return packages;
    } catch (error) {
        console.error("Error parsing yarn.lock:", error);
        return [];
    }
}
