import { Octokit } from "octokit";
import { KNOWN_LOCK_FILES } from "../util/autodetectLockFile";

interface LockFile {
    path: string;
    content: string;
}

interface GithubSearchResponse {
    data: {
        items: {
            path: string;
        }[];
    };
}

interface GithubContentResponse {
    data: {
        content: string;
    };
}

export async function findLockFilesFromRepo({
    repo,
    owner,
}: {
    repo: string;
    owner: string;
}): Promise<LockFile[]> {
    if (!process.env.GITHUB_TOKEN) {
        throw new Error("GITHUB_TOKEN environment variable not set");
    }

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
    });

    const results = await Promise.all(
        KNOWN_LOCK_FILES.map(async (lockFile): Promise<LockFile[]> => {
            try {
                const codeResults = (await octokit.rest.search.code({
                    q: `repo:${owner}/${repo} in:path ${lockFile}`,
                })) as GithubSearchResponse;

                const responses = await Promise.all(
                    codeResults.data.items.map(async (item) => {
                        const response = (await octokit.rest.repos.getContent({
                            owner,
                            repo,
                            path: item.path,
                        })) as GithubContentResponse;

                        return {
                            data: response.data,
                            path: item.path,
                        };
                    }),
                );

                return responses
                    .map(({ path, data }): LockFile | null => {
                        if (!("content" in data)) {
                            return null;
                        }
                        const content = Buffer.from(
                            data.content,
                            "base64",
                        ).toString("utf-8");
                        return {
                            path,
                            content,
                        };
                    })
                    .filter((item) => item != null);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.warn(`Failed to fetch ${lockFile}:`, error.message);
                }
                return [];
            }
        }),
    );

    return results.flat().filter((item) => item != null);
}
