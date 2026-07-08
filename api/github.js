/**
 * ShiftPvP Admin Console Backend - GitHub REST API Client Wrapper
 * Implements low-level operational orchestration for raw file fetching, tree SHA resolution, 
 * base64 encoding mutations, and atomic repository pushes.
 */

export class GitHubRepositoryService {
    constructor() {
        // Mengambil kredensial dari environment variables di hosting (Vercel/Netlify)
        this.token = process.env.GITHUB_TOKEN;
        this.owner = process.env.GITHUB_OWNER;
        this.repo = process.env.GITHUB_REPO;
        this.path = process.env.PLAYERS_PATH || 'data/players.json';
        this.baseUrl = 'https://api.github.com';

        this.validateEnvironmentConfiguration();
    }

    /**
     * Memastikan semua kunci akses tidak kosong sebelum menembak GitHub API
     */
    validateEnvironmentConfiguration() {
        if (!this.token || !this.owner || !this.repo) {
            throw new Error(
                `Critical Configuration Exception: Missing essential upstream environmental credentials. ` +
                `Missing fields: [ ${!this.token ? 'GITHUB_TOKEN ' : ''}${!this.owner ? 'GITHUB_OWNER ' : ''}${!this.repo ? 'GITHUB_REPO' : ''} ]`
            );
        }
    }

    /**
     * Menyusun susunan header standar untuk request ke GitHub REST API
     */
    getRequestHeaders() {
        return {
            'Authorization': `Bearer ${this.token.trim()}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'ShiftPvP-Management-Console-Serverless'
        };
    }

    /**
     * Mengambil struktur file terbaru, kode SHA, isi konten Base64, dan log commit terakhir
     */
    async fetchFileDescriptorTree() {
        const fileUrl = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${this.path}`;
        const commitUrl = `${this.baseUrl}/repos/${this.owner}/${this.repo}/commits?path=${this.path}&per_page=1`;

        try {
            const fileResponse = await fetch(fileUrl, {
                method: 'GET',
                headers: this.getRequestHeaders()
            });

            if (!fileResponse.ok) {
                if (fileResponse.status === 404) {
                    throw new Error(`File target path mapping failure: '${this.path}' tidak ditemukan di repositori.`);
                }
                throw new Error(`Upstream platform connection exception: HTTP Status ${fileResponse.status}`);
            }

            const fileData = await fileResponse.json();

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
                console.warn("[GitHub API Warning] Gagal memetakan metadata commit terakhir:", commitErr);
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
            console.error("[GitHub Service Exception] Terjadi error pada fungsi fetch:", error);
            throw error;
        }
    }

    /**
     * Melakukan commit perubahan data (add/edit/delete) langsung ke GitHub repo
     */
    async pushContentMutationCommit(updatedJsonPayload, targetTreeSha, commitLogMessage) {
        const fileUrl = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${this.path}`;
        
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
                throw new Error(data.message || `Mutation failed with status: ${response.status}`);
            }

            return {
                success: true,
                commitSha: data.commit.sha,
                updatedPath: this.path
            };
        } catch (error) {
            console.error("[GitHub Mutation Critical Failure]:", error);
            throw error;
        }
    }
}
