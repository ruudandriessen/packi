import { readFileSync } from "node:fs";
import JSON5 from "json5";
import type { Package } from "../models/Package";

interface BunLockFile {
    lockfileVersion: number;
    workspaces: {
        [workspacePath: string]: {
            name: string;
            dependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
        };
    };
    packages: Record<
        string,
        [string, string, { dependencies: Record<string, string> }, string]
    >;
}

export function parseBunLock(lockPath: string): Package[] {
    try {
        const lockContent = readFileSync(lockPath, "utf-8");
        const { workspaces, packages } = JSON5.parse(
            lockContent,
        ) as BunLockFile;

        const installedDependencies = Object.values(workspaces).flatMap(
            (workspace) => {
                const dependencies = workspace.dependencies ?? {};
                const devDependencies = workspace.devDependencies ?? {};

                return Object.keys(dependencies).concat(
                    Object.keys(devDependencies),
                );
            },
        );

        const result = Object.entries(packages)
            .filter(([path]) => installedDependencies.includes(path))
            .map(([path, [pkgAndVersion]]) => {
                const split = pkgAndVersion.split("@");
                const version = split[split.length - 1];

                if (version === undefined) {
                    throw new Error("Version is undefined");
                }

                return { name: path, version, registry: "npm" as const };
            });

        return result;
    } catch (error) {
        console.error("Error parsing bun.lockb:", error);
        return [];
    }
}
