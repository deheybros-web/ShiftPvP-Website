/**
 * ShiftPvP Admin Console - Player Management Matrix Client Engine
 * Handles local state computation, atomic transactional point calculations, modal lifecycles, and live filtering.
 */

import { ApiClient } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Structural Security Barrier
    const operator = ApiClient.getAuthenticatedOperator();
    if (!operator) {
        ApiClient.handleUnauthorizedLifecycle();
        return;
    }

    // Tier Values Configuration Weights
    const TIER_WEIGHTS = {
        'HT1': 20, 'LT1': 18, 'HT2': 16, 'LT2': 14,
        'HT3': 12, 'LT3': 10, 'HT4': 8,  'LT4': 6,
        'HT5': 4,  'LT5': 2,  'NONE': 0
    };

    const COMBAT_CATEGORIES = ['Sword', 'Nethpot', 'Crystal', 'UHC', 'Mace', 'SMP', 'Diasmp'];

    // State Variables
    let primaryRosterState = [];
    let activeFilterQuery = '';
    let scheduledSearchDebounceTimeout = null;
    let explicitDeleteUsernameTarget = null;

    // DOM Selection Tokens
    const operatorName = document.getElementById('operatorName');
    const operatorRole = document.getElementById('operatorRole');
    const operatorAvatar = document.getElementById('operatorAvatar');
    const logoutBtn = document.getElementById('logoutBtn');

    const rosterTableBody = document.getElementById('rosterTableBody');
    const tableOverlayLoader = document.getElementById('tableOverlayLoader');
    const searchLoader = document.getElementById('searchLoader');
    const playerSearchInput = document.getElementById('playerSearchInput');
    const refreshPlayersBtn = document.getElementById('refreshPlayersBtn');
    const emptyTableState = document.getElementById('emptyTableState');

    // Modals
    const addPlayerModal = document.getElementById('addPlayerModal');
    const editPlayerModal = document.getElementById('editPlayerModal');
    const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');

    // Forms & Inputs
    const addPlayerForm = document.getElementById('addPlayerForm');
    const editPlayerForm = document.getElementById('editPlayerForm');
    const openAddModalBtn = document.getElementById('openAddModalBtn');
    const addPointsDisplay = document.getElementById('addPointsDisplay');
    const editPointsDisplay = document.getElementById('editPointsDisplay');
    const editPlayerHeadingTarget = document.getElementById('editPlayerHeadingTarget');
    const editOriginalUsername = document.getElementById('editOriginalUsername');
    const deleteTargetUsernameDisplay = document.getElementById('deleteTargetUsernameDisplay');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    // Bind operator data profiles into sidebar context panels
    operatorName.textContent = operator.displayName;
    operatorRole.textContent = `Access Level: ${operator.role.toUpperCase()}`;
    operatorAvatar.textContent = operator.displayName.substring(0, 2).toUpperCase();

    /**
     * Instantiates selectable drop-down structural matrix markup tokens
     */
    function seedTierSelectionSelectors() {
        const structuralSelectors = document.querySelectorAll('[data-tier-select]');
        structuralSelectors.forEach(selectElement => {
            selectElement.innerHTML = '';
            Object.keys(TIER_WEIGHTS).forEach(tierKey => {
                const option = document.createElement('option');
                option.value = tierKey;
                option.textContent = tierKey === 'NONE' ? 'NONE / UNRANKED' : tierKey;
                selectElement.appendChild(option);
            });
        });
    }

    /**
     * Pure function to calculate a player's cumulative total points base weight
     */
    function calculateFunctionalPointsWeight(playerRecord) {
        return COMBAT_CATEGORIES.reduce((runningSum, category) => {
            const tierVal = (playerRecord[category] || 'NONE').toUpperCase();
            return runningSum + (TIER_WEIGHTS[tierVal] || 0);
        }, 0);
    }

    /**
     * Synchronizes local forms to perform real-time point recalculation updates
     */
    function bindPointCalculationInterceptors(formId, targetPointsDisplay) {
        const formNode = document.getElementById(formId);
        const dynamicSelectors = formNode.querySelectorAll('[data-tier-select]');
        
        const computeHandler = () => {
            const compositeObject = {};
            dynamicSelectors.forEach(select => {
                const categoryName = select.id.replace(formId.startsWith('add') ? 'add' : 'edit', '');
                compositeObject[categoryName] = select.value;
            });
            targetPointsDisplay.textContent = calculateFunctionalPointsWeight(compositeObject);
        };

        dynamicSelectors.forEach(select => select.addEventListener('change', computeHandler));
    }

    /**
     * Polls serverless infrastructure directly to reload player dataset
     */
    async function pullUpstreamRosterMatrix() {
        tableOverlayLoader.classList.remove('hidden');
        try {
            const response = await ApiClient.get('/players');
            primaryRosterState = response.players || [];
            applyRenderPipeline();
        } catch (error) {
            ApiClient.showToast(error.message || "Failed pulling upstream storage parameters.", "error");
        } finally {
            tableOverlayLoader.classList.add('hidden');
        }
    }

    /**
     * Filters, sorts, and renders the player data array down to the interface table
     */
    function applyRenderPipeline() {
        rosterTableBody.innerHTML = '';
        
        const normalizedQuery = activeFilterQuery.toLowerCase().trim();
        const filteredDataset = primaryRosterState.filter(player => 
            player.username.toLowerCase().includes(normalizedQuery)
        );

        if (filteredDataset.length === 0) {
            emptyTableState.classList.remove('hidden');
            return;
        }
        emptyTableState.classList.add('hidden');

        // Render rows sequentially
        filteredDataset.forEach(player => {
            const row = document.createElement('tr');
            
            let categoriesHtml = '';
            COMBAT_CATEGORIES.forEach(cat => {
                const tier = (player[cat] || 'NONE').toUpperCase();
                const badgeClass = `tier-badge t-${tier.toLowerCase()}`;
                categoriesHtml += `<td><span class="${badgeClass}">${tier}</span></td>`;
            });

            row.innerHTML = `
                <td class="player-identity-cell">${escapeHtmlMarkup(player.username)}</td>
                ${categoriesHtml}
                <td class="text-center"><span class="points-total-badge">${player.points || 0}</span></td>
                <td class="text-right">
                    <div class="table-actions-wrapper">
                        <button class="action-icon-btn btn-edit-action" data-action-edit="${escapeHtmlMarkup(player.username)}">✏️</button>
                        <button class="action-icon-btn btn-delete-action" data-action-delete="${escapeHtmlMarkup(player.username)}">🗑️</button>
                    </div>
                </td>
            `;
            rosterTableBody.appendChild(row);
        });

        bindTableRowActionListeners();
    }

    /**
     * Attaches live contextual triggers directly to dynamically mounted table assets
     */
    function bindTableRowActionListeners() {
        document.querySelectorAll('[data-action-edit]').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetUser = btn.getAttribute('data-action-edit');
                const matchedRecord = primaryRosterState.find(p => p.username === targetUser);
                if (matchedRecord) openMutationEditWorkspace(matchedRecord);
            });
        });

        document.querySelectorAll('[data-action-delete]').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetUser = btn.getAttribute('data-action-delete');
                openDestructionConfirmationAlert(targetUser);
            });
        });
    }

    /**
     * Pre-populates and expands the Edit Player workflow view screen
     */
    function openMutationEditWorkspace(playerRecord) {
        editOriginalUsername.value = playerRecord.username;
        editPlayerUsernameInputTarget().value = playerRecord.username;
        editPlayerHeadingTarget.textContent = playerRecord.username.toUpperCase();

        COMBAT_CATEGORIES.forEach(cat => {
            const selectField = document.getElementById(`edit${cat}`);
            if (selectField) selectField.value = (playerRecord[cat] || 'NONE').toUpperCase();
        });

        editPointsDisplay.textContent = playerRecord.points || 0;
        editPlayerModal.classList.remove('hidden');
    }

    function editPlayerUsernameInputTarget() {
        return document.getElementById('editUsername');
    }

    /**
     * Locks deletion pipeline targeting parameters and visualizes approval box
     */
    function openDestructionConfirmationAlert(username) {
        explicitDeleteUsernameTarget = username;
        deleteTargetUsernameDisplay.textContent = username;
        deleteConfirmationModal.classList.remove('hidden');
    }

    /**
     * Safe contextual escaping mechanism to handle complex identity text strings
     */
    function escapeHtmlMarkup(string) {
        return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Modal Global Shutdown Event Interceptors
    document.querySelectorAll('[data-close-modal]').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            addPlayerModal.classList.add('hidden');
            editPlayerModal.classList.add('hidden');
            deleteConfirmationModal.classList.add('hidden');
        });
    });

    // Handle Active Live Search Inputs and Debounced Execution Loops
    playerSearchInput.addEventListener('input', (e) => {
        activeFilterQuery = e.target.value;
        searchLoader.classList.remove('hidden');
        
        clearTimeout(scheduledSearchDebounceTimeout);
        scheduledSearchDebounceTimeout = setTimeout(() => {
            applyRenderPipeline();
            searchLoader.classList.add('hidden');
        }, 250);
    });

    // Form submission processing pipeline workflows
    addPlayerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = addPlayerForm.querySelector('button[type="submit"]');
        const loader = submitButton.querySelector('.btn-loader');
        
        const packagePayload = {
            username: document.getElementById('addUsername').value.trim(),
            ...COMBAT_CATEGORIES.reduce((acc, cat) => {
                acc[cat] = document.getElementById(`add${cat}`).value;
                return acc;
            }, {})
        };

        submitButton.disabled = true;
        loader.classList.remove('hidden');

        try {
            await ApiClient.post('/addPlayer', packagePayload);
            ApiClient.showToast(`Successfully created ${packagePayload.username} player record entry.`, 'success');
            addPlayerForm.reset();
            addPointsDisplay.textContent = '0';
            addPlayerModal.classList.add('hidden');
            await pullUpstreamRosterMatrix();
        } catch (err) {
            ApiClient.showToast(err.message || "Failed finalizing player addition entry.", "error");
        } finally {
            submitButton.disabled = false;
            loader.classList.add('hidden');
        }
    });

    editPlayerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = editPlayerForm.querySelector('button[type="submit"]');
        const loader = submitButton.querySelector('.btn-loader');

        const packagePayload = {
            originalUsername: editOriginalUsername.value,
            username: editPlayerUsernameInputTarget().value.trim(),
            ...COMBAT_CATEGORIES.reduce((acc, cat) => {
                acc[cat] = document.getElementById(`edit${cat}`).value;
                return acc;
            }, {})
        };

        submitButton.disabled = true;
        loader.classList.remove('hidden');

        try {
            await ApiClient.put('/editPlayer', packagePayload);
            ApiClient.showToast(`Successfully mutated player configurations for ${packagePayload.username}.`, 'success');
            editPlayerModal.classList.add('hidden');
            await pullUpstreamRosterMatrix();
        } catch (err) {
            ApiClient.showToast(err.message || "Failed saving mutation adjustments.", "error");
        } finally {
            submitButton.disabled = false;
            loader.classList.add('hidden');
        }
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        if (!explicitDeleteUsernameTarget) return;
        const loader = confirmDeleteBtn.querySelector('.btn-loader');
        
        confirmDeleteBtn.disabled = true;
        cancelDeleteBtn.disabled = true;
        loader.classList.remove('hidden');

        try {
            await ApiClient.delete('/deletePlayer', { username: explicitDeleteUsernameTarget });
            ApiClient.showToast(`Purged player ${explicitDeleteUsernameTarget} from system logs.`, 'success');
            deleteConfirmationModal.classList.add('hidden');
            await pullUpstreamRosterMatrix();
        } catch (err) {
            ApiClient.showToast(err.message || "Failed executing player erasure commit.", "error");
        } finally {
            confirmDeleteBtn.disabled = false;
            cancelDeleteBtn.disabled = false;
            loader.classList.add('hidden');
            explicitDeleteUsernameTarget = null;
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteConfirmationModal.classList.add('hidden');
        explicitDeleteUsernameTarget = null;
    });

    openAddModalBtn.addEventListener('click', () => {
        addPlayerForm.reset();
        addPointsDisplay.textContent = '0';
        addPlayerModal.classList.remove('hidden');
    });

    refreshPlayersBtn.addEventListener('click', pullUpstreamRosterMatrix);
    logoutBtn.addEventListener('click', () => ApiClient.handleUnauthorizedLifecycle());

    // Initialize Structural Workspace Modules
    seedTierSelectionSelectors();
    bindPointCalculationInterceptors('addPlayerForm', addPointsDisplay);
    bindPointCalculationInterceptors('editPlayerForm', editPointsDisplay);
    pullUpstreamRosterMatrix();
});
