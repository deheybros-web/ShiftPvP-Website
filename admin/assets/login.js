/**
 * ShiftPvP Admin Console - Client Authentication Engine
 * Coordinates interface validation pipelines and establishes security state boundaries.
 */

import { ApiClient } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = document.getElementById('submitBtn');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const btnText = submitBtn.querySelector('.btn-text');

    // Security Guard: Redirect active operators away from login portal back into workspace core
    const existingSession = ApiClient.getAuthenticatedOperator();
    if (existingSession) {
        window.location.href = 'dashboard.html';
        return;
    }

    /**
     * Toggles transactional button interaction states
     */
    function toggleLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnLoader.classList.remove('hidden');
            btnText.textContent = 'AUTHORIZING OPERATOR...';
        } else {
            submitBtn.disabled = false;
            btnLoader.classList.add('hidden');
            btnText.textContent = 'INITIALIZE SESSION';
        }
    }

    /**
     * Renders or flushes validation failure exceptions across the layout view
     */
    function renderException(message) {
        if (!message) {
            errorMessage.classList.add('hidden');
            errorMessage.querySelector('.error-text').textContent = '';
        } else {
            errorMessage.classList.remove('hidden');
            errorMessage.querySelector('.error-text').textContent = message.toUpperCase();
        }
    }

    // Intercept submit operations to forward credentials securely downstream
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        renderException(null);
        toggleLoadingState(true);

        const credentials = {
            username: usernameInput.value.trim(),
            password: passwordInput.value
        };

        try {
            const response = await ApiClient.post('/login', credentials);

            if (response && response.authenticated) {
                // Store non-sensitive operator metadata profiles safely within localized browser storage
                localStorage.setItem('shift_pvp_session', JSON.stringify({
                    username: response.user.username,
                    displayName: response.user.displayName,
                    role: response.user.role,
                    timestamp: Date.now()
                }));

                ApiClient.showToast(`Welcome back, Commander ${response.user.displayName}!`, 'success');
                
                // Allow notification to render fully before changing window state
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                throw new Error(response.message || 'Access denied by authorization protocol.');
            }
        } catch (error) {
            renderException(error.message || 'Network handshake failed. Infrastructure offline.');
            ApiClient.showToast(error.message || 'Authentication sequence aborted.', 'error');
            toggleLoadingState(false);
        }
    });
});
