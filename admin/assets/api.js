/**
 * ShiftPvP Admin Console - Global API Client Bridge
 * Core network infrastructure with interceptors, exception routing, and session propagation.
 */

const API_BASE = '/api';

export const ApiClient = {
    /**
     * Internal generic request orchestration dispatcher
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        
        // Inject global headers for content-type routing
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // If unauthorized or expired session context found, route directly to logout routine
                if (response.status === 401 && !endpoint.includes('/login')) {
                    ApiClient.handleUnauthorizedLifecycle();
                }
                throw new Error(data.message || `HTTP Execution Exception: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`[API Network Fault] ${endpoint}:`, error);
            throw error;
        }
    },

    /**
     * HTTP GET request dispatcher
     */
    async get(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'GET', headers });
    },

    /**
     * HTTP POST mutation dispatcher
     */
    async post(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            headers
        });
    },

    /**
     * HTTP PUT mutation dispatcher
     */
    async put(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers
        });
    },

    /**
     * HTTP DELETE mutation dispatcher
     */
    async delete(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'DELETE',
            body: JSON.stringify(body),
            headers
        });
    },

    /**
     * Validates active runtime memory storage for authenticated sessions
     */
    getAuthenticatedOperator() {
        const sessionToken = localStorage.getItem('shift_pvp_session');
        if (!sessionToken) return null;
        try {
            return JSON.parse(sessionToken);
        } catch (e) {
            this.handleUnauthorizedLifecycle();
            return null;
        }
    },

    /**
     * Secures client-side redirection state parameters when sessions expire
     */
    handleUnauthorizedLifecycle() {
        localStorage.removeItem('shift_pvp_session');
        if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/admin/') {
            window.location.href = 'index.html';
        }
    },

    /**
     * UI Notification Toast Overlay Dispatcher Engine
     */
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? '⚡' : '🚨';
        toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
        
        container.appendChild(toast);

        // Synchronize deletion from layout DOM nodes after animation lifecycles finish
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};
