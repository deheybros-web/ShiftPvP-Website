/**
 * ShiftPvP Admin Console Backend - Player Fetch Engine
 * GET /api/players
 * Pulls the live data tree from the GitHub Repository, serving as the central source of truth.
 */

import { GitHubRepositoryService } from './github.js';

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'GET') {
        res.status(405).json({ success: false, message: 'HTTP Method Not Allowed.' });
        return;
    }

    try {
        const githubService = new GitHubRepositoryService();
        
        // Fetch the remote repository state data object directly
        const repoState = await githubService.fetchFileDescriptorTree();

        // Safety fallback: Ensure player list array parsing integrity checks pass
        let players = [];
        if (Array.isArray(repoState.decodedJsonPayload)) {
            players = repoState.decodedJsonPayload;
        } else if (repoState.decodedJsonPayload && Array.isArray(repoState.decodedJsonPayload.players)) {
            players = repoState.decodedJsonPayload.players;
        }

        res.status(200).json({
            success: true,
            players: players,
            metadata: repoState.metadata
        });

    } catch (error) {
        console.error("[Fetch Engine Core Failure] Failed parsing upstream repository state:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Upstream data collection tree could not be successfully resolved.' 
        });
    }
}
