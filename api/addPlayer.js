/**
 * ShiftPvP Admin Console Backend - Add Player Endpoint
 * POST /api/addPlayer
 * Atomically pulls data from GitHub, checks for duplicate usernames,
 * recalculates point matrices, and pushes an updated commit upstream.
 */

import { GitHubRepositoryService } from './github.js';

const TIER_WEIGHTS = {
    'HT1': 20, 'LT1': 18, 'HT2': 16, 'LT2': 14,
    'HT3': 12, 'LT3': 10, 'HT4': 8,  'LT4': 6,
    'HT5': 4,  'LT5': 2,  'NONE': 0
};

const COMBAT_CATEGORIES = ['Sword', 'Nethpot', 'Crystal', 'UHC', 'Mace', 'SMP', 'Diasmp'];

/**
 * Pure function utility to compute total score weights based on structural player tiers
 */
function calculatePoints(player) {
    return COMBAT_CATEGORIES.reduce((sum, cat) => {
        const tier = (player[cat] || 'NONE').toUpperCase();
        return sum + (TIER_WEIGHTS[tier] || 0);
    }, 0);
}

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        res.status(405).json({ success: false, message: 'HTTP Method Not Allowed.' });
        return;
    }

    try {
        const { username, Sword, Nethpot, Crystal, UHC, Mace, SMP, Diasmp } = req.body;

        if (!username || !username.trim()) {
            res.status(400).json({ success: false, message: 'Minecraft username identifier is required.' });
            return;
        }

        const targetUsername = username.trim();
        const githubService = new GitHubRepositoryService();
        
        // Transaction Lock stage: Pull current tree and SHA reference signatures
        const repoState = await githubService.fetchFileDescriptorTree();
        let playersCollection = [];

        if (Array.isArray(repoState.decodedJsonPayload)) {
            playersCollection = repoState.decodedJsonPayload;
        } else if (repoState.decodedJsonPayload && Array.isArray(repoState.decodedJsonPayload.players)) {
            playersCollection = repoState.decodedJsonPayload.players;
        }

        // Enforce strong domain duplicate protection
        const exists = playersCollection.some(p => p.username.toLowerCase() === targetUsername.toLowerCase());
        if (exists) {
            res.status(409).json({ success: false, message: `Player '${targetUsername}' already exists inside the roster matrix.` });
            return;
        }

        // Construct clean structural record entry
        const newPlayerRecord = {
            username: targetUsername,
            Sword: Sword || 'NONE',
            Nethpot: Nethpot || 'NONE',
            Crystal: Crystal || 'NONE',
            UHC: UHC || 'NONE',
            Mace: Mace || 'NONE',
            SMP: SMP || 'NONE',
            Diasmp: Diasmp || 'NONE',
            points: 0
        };

        // Automate point calculation execution
        newPlayerRecord.points = calculatePoints(newPlayerRecord);

        // Append record directly into the dataset array mapping structures
        playersCollection.push(newPlayerRecord);

        // Commit updated tracking block array directly back upstream to GitHub REST branch heads
        const commitMessage = `feat(roster): provision entry for player '${targetUsername}' [skip ci]`;
        const writeResult = await githubService.pushContentMutationCommit(
            playersCollection, 
            repoState.sha, 
            commitMessage
        );

        res.status(201).json({
            success: true,
            message: `Successfully provisioned ${targetUsername} inside system rosters.`,
            commitSha: writeResult.commitSha
        });

    } catch (error) {
        console.error("[Add Player Operational Controller Failure]:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Atomic modification sequence tracking context aborted.' 
        });
    }
}
