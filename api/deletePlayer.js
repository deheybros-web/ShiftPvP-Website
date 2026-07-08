/**
 * ShiftPvP Admin Console Backend - Delete Player Endpoint
 * DELETE /api/deletePlayer
 * Atomically pulls the remote player roster tree, filters out the requested target,
 * and updates the GitHub directory structure with a removal commit.
 */

import { GitHubRepositoryService } from './github.js';

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'DELETE') {
        res.status(405).json({ success: false, message: 'HTTP Method Not Allowed.' });
        return;
    }

    try {
        const { username } = req.body;

        if (!username || !username.trim()) {
            res.status(400).json({ success: false, message: 'Minecraft username identifier is required to complete removal.' });
            return;
        }

        const targetUsername = username.trim();
        const githubService = new GitHubRepositoryService();

        // Transaction Lock stage: Fetch current repository state
        const repoState = await githubService.fetchFileDescriptorTree();
        let playersCollection = [];

        if (Array.isArray(repoState.decodedJsonPayload)) {
            playersCollection = repoState.decodedJsonPayload;
        } else if (repoState.decodedJsonPayload && Array.isArray(repoState.decodedJsonPayload.players)) {
            playersCollection = repoState.decodedJsonPayload.players;
        }

        // Verify the target record actually exists prior to filtering mutations
        const initialCount = playersCollection.length;
        playersCollection = playersCollection.filter(p => p.username.toLowerCase() !== targetUsername.toLowerCase());

        if (playersCollection.length === initialCount) {
            res.status(404).json({ success: false, message: `Player entry for '${targetUsername}' could not be located.` });
            return;
        }

        // Push deletion transaction to the public tracking branch head
        const commitMessage = `gc(roster): purge record entry for '${targetUsername}' [skip ci]`;
        const writeResult = await githubService.pushContentMutationCommit(
            playersCollection,
            repoState.sha,
            commitMessage
        );

        res.status(200).json({
            success: true,
            message: `Successfully purged player ${targetUsername} from system logs.`,
            commitSha: writeResult.commitSha
        });

    } catch (error) {
        console.error("[Delete Player Operational Mutation Failure]:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Upstream server transaction loop dropped or aborted.' 
        });
    }
}
