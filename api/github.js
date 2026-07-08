/**
 * ShiftPvP Admin Console Backend - GitHub REST API Client Wrapper
 * Implements low-level operational orchestration for raw file fetching, tree SHA resolution, 
 * base64 encoding mutations, and atomic repository pushes.
 */

export class GitHubRepositoryService {
    constructor() {
        this.token = process.env.GITHUB_TOKEN;
        this.owner = process.env.GITHUB_OWNER;
        this.repo = process.env.GITHUB_REPO;
        this.path = process.env.PLAYERS_PATH || 'data/players.json';
        this.baseUrl = 'https://api.github.com';

        this.validateEnvironmentConfiguration();
    }

    /**
     * Prevents runtime serverless function execution if the host instance is missing environmental configurations
     */
    validateEnvironmentConfiguration() {
        if (!this.token || !this.owner || !this.repo) {
            throw new Error("Critical Configuration Exception: Missing essential upstream environmental credentials.");
        }
    }

    /**
     * Compiles standardized request header parameters required to communicate with the GitHub platform
     */
    getRequestHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'ShiftPvP-Management-Console-Serverless'
        };
    }

    /**
     * Obtains the target file's current SHA hash signature, raw base64 content stream, and recent commit history trace
     */
    async fetchFileDescriptorTree() {
        const fileUrl = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${this.path}`;
        const commitUrl = `${this.baseUrl}/repos/${this.owner}/${this.repo}/commits?path=${this.path}&per_page=1`;

        try {
            // Retrieve file descriptor content payload parameters
            const fileResponse = await fetch(fileUrl, {
                method: 'GET',
                headers: this.getRequestHeaders()
            });

            if (!fileResponse.ok) {
                if (fileResponse.status === 404) {
                    throw new Error(`File target path mapping failure: '${this.path}' does not exist inside the specified repository structure.`);
                }
                throw new Error(`Upstream platform connection exception returned status code: ${fileResponse.status}`);
            }

            const fileData = await fileResponse.json();

            // Extract the latest commit details from the reference target branch path tree
            let commitMetadata = null;
            try {
                const commitResponse = await fetch(commitUrl, {
                    method: 'GET',
                    headers: this.getRequestHeaders()
                });
                if (commitResponse.ok) {
                    const commits = await commitResponse.json();
                    if (commits && commits.length > 0) {
                        commitMetadata = {
                            sha: commits[0].sha,
                            message: commits[0].commit.message,
                            date: commits[0].commit.author.date,
                            author: commits[0].commit.author.name
                        };
                    }
                }
            } catch (commitErr) {
                console.error("[GitHub API Internal Logging Warning] Unresolved commit meta mapping loop:", commitErr);
            }

            return {
                sha: fileData.sha,
                contentRawBase64: fileData.content,
                decodedJsonPayload: JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8')),
                metadata: {
                    owner: this.owner,
                    repo: this.repo,
                    path: this.path,
                    commit: commitMetadata
                }
            };
        } catch (error) {
            console.error("[GitHub Service Exception Failure] Error occurred inside execution routine:", error);
            throw error;
        }
    }

    /**
     * Executes an atomic HTTP PUT content write mutation to establish a brand new repository commit trace line
     */
    async pushContentMutationCommit(updatedJsonPayload, targetTreeSha, commitLogMessage) {
        const fileUrl = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${this.path}`;
        
        // Minimize whitespace and form valid JSON content parameters prior to base64 structural translation
        const compactJsonString = JSON.stringify(updatedJsonPayload, null, 2);
        const encodedBase64Content = Buffer.from(compactJsonString, 'utf-8').toString('base64');

        const requestBody = {
            message: commitLogMessage,
            content: encodedBase64Content,
            sha: targetTreeSha
        };

        try {
            const response = await fetch(fileUrl, {
                method: 'PUT',
                headers: this.getRequestHeaders(),
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Upstream update transaction failed with structural status code: ${response.status}`);
            }

            return {
                success: true,
                commitSha: data.commit.sha,
                updatedPath: this.path
            };
        } catch (error) {
            console.error("[GitHub Mutation Critical Pipeline Failure]:", error);
            throw error;
        }
    }
}
