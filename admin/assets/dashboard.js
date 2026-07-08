/**
 * ShiftPvP Admin Console - Core Dashboard Engine
 * Tracks ecosystem statuses, syncs live workspace context, and reads Git tree structures.
 */

import { ApiClient } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Structural Verification Check
    const operator = ApiClient.getAuthenticatedOperator();
    if (!operator) {
        ApiClient.handleUnauthorizedLifecycle();
        return;
    }

    // Bind DOM Layout targets
    const operatorName = document.getElementById('operatorName');
    const operatorRole = document.getElementById('operatorRole');
    const operatorAvatar = document.getElementById('operatorAvatar');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshMetricsBtn = document.getElementById('refreshMetricsBtn');

    const metricTotalPlayers = document.getElementById('metricTotalPlayers');
    const metricTopPlayer = document.getElementById('metricTopPlayer');
    const metricTopPoints = document.getElementById('metricTopPoints');
    const metricCommitHash = document.getElementById('metricCommitHash');
    const metricCommitMessage = document.getElementById('metricCommitMessage');
    const metricCommitDate = document.getElementById('metricCommitDate');
    const metricAdminName = document.getElementById('metricAdminName');

    const metaRepo = document.getElementById('metaRepo');
    const metaPath = document.getElementById('metaPath');

    // Display Active Operator Metadata In Sidebar Viewport
    operatorName.textContent = operator.displayName;
    operatorRole.textContent = `Access Level: ${operator.role.toUpperCase()}`;
    operatorAvatar.textContent = operator.displayName.substring(0, 2).toUpperCase();
    metricAdminName.textContent = operator.displayName;

    /**
     * Polls downstream API endpoints to sync transactional state values
     */
    async function synchroniseDashboardState() {
        try {
            metricCommitMessage.textContent = "Querying repository matrix...";
            
            // Execute parallel fetch ops to secure data blocks efficiently
            const data = await ApiClient.get('/players');
            
            if (!data || !data.players) {
                throw new Error("Invalid payload format returned from upstream resource.");
            }

            const playersList = data.players;
            
            // Populate System Metadata Details Box
            metaRepo.textContent = `${data.metadata.owner}/${data.metadata.repo}`;
            metaPath.textContent = data.metadata.path;

            // Compute Total Players metric Card
            metricTotalPlayers.textContent = playersList.length;

            // Compute Top Competitor metrics Card
            if (playersList.length > 0) {
                const absoluteLeader = [...playersList].sort((a, b) => (b.points || 0) - (a.points || 0))[0];
                metricTopPlayer.textContent = absoluteLeader.username;
                metricTopPlayer.title = absoluteLeader.username; // handle hover fallback text overflows
                metricTopPoints.textContent = `${absoluteLeader.points || 0} Points`;
            } else {
                metricTopPlayer.textContent = "VACANT";
                metricTopPoints.textContent = "0 Points";
            }

            // Sync and Format Git Repository Commit Tree Details
            if (data.metadata.commit) {
                const sha = data.metadata.commit.sha;
                metricCommitHash.textContent = sha.substring(0, 7).toUpperCase();
                metricCommitHash.title = sha;
                metricCommitMessage.textContent = data.metadata.commit.message;
                metricCommitMessage.title = data.metadata.commit.message;
                
                // Formulate legible time formats for standard operations
                const commitDate = new Date(data.metadata.commit.date);
                metricCommitDate.textContent = `Pushed: ${commitDate.toLocaleDateString()} ${commitDate.toLocaleTimeString()}`;
            } else {
                metricCommitHash.textContent = "UNKNOWN";
                metricCommitMessage.textContent = "No history entry found inside active branch tracking root.";
                metricCommitDate.textContent = "--";
            }

            ApiClient.showToast("Ecosystem metrics successfully synced.", "success");
        } catch (error) {
            metricCommitHash.textContent = "ERROR";
            metricCommitMessage.textContent = "Sync failed. Check API runtime configuration.";
            ApiClient.showToast(error.message || "Metrics parsing lifecycle failed.", "error");
        }
    }

    // Set Global Action Operations
    refreshMetricsBtn.addEventListener('click', () => {
        synchroniseDashboardState();
    });

    logoutBtn.addEventListener('click', () => {
        ApiClient.handleUnauthorizedLifecycle();
    });

    // Execute core process thread on window load sequence
    synchroniseDashboardState();
});
