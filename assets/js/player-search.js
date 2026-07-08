/**
 * ShiftPvP - Player Search Widget (ALL-IN-ONE / SELF-INJECTING)
 * ------------------------------------------------------------
 * File ini SATU-SATUNYA yang perlu kamu tambahkan. Sudah termasuk:
 *   - CSS widget (di-inject otomatis ke <head>)
 *   - Markup kotak pencarian (di-inject otomatis ke halaman)
 *   - Logic pencarian (baca data/players.json)
 *
 * CARA PASANG:
 *   1. Taruh file ini di: assets/js/player-search.js
 *   2. Tambahkan SATU baris ini sebelum </body> di index.html:
 *
 *        <script src="assets/js/player-search.js"></script>
 *
 *   Selesai. Tidak perlu ubah CSS atau HTML lain.
 *
 * Widget ini otomatis mencari lokasi tabel leaderboard (elemen dengan
 * id="leaderboard-rows-container", sesuai ranking.js) dan menaruh kotak
 * pencarian TEPAT DI ATAS tabel itu. Kalau elemen itu tidak ditemukan
 * di halaman (misal dipasang di halaman lain), widget akan taruh dirinya
 * di awal <main>, atau di awal <body> sebagai fallback terakhir.
 *
 * Karena mengambil data langsung dari data/players.json, SEMUA player
 * bisa ditemukan -- termasuk yang tidak muncul di leaderboard tier
 * manapun (semua tiernya "-").
 */

(function () {
    'use strict';

    /* ======================================================================
       0. KONFIGURASI
       ====================================================================== */
    const DATA_URL = 'data/players.json'; // sama seperti path yang dipakai ranking.js
    const MAX_RESULTS = 20;
    const DEBOUNCE_MS = 150;

    const TIER_POINTS = {
        "HT1": 20, "LT1": 18,
        "HT2": 16, "LT2": 14,
        "HT3": 12, "LT3": 10,
        "HT4": 8,  "LT4": 6,
        "HT5": 4,  "LT5": 2,
        "—": 0, "unranked": 0
    };

    const GAMEMODES = [
        { key: "sword",   label: "Sword" },
        { key: "nethpot", label: "NethPot" },
        { key: "crystal", label: "Crystal" },
        { key: "mace",    label: "Mace" },
        { key: "uhc",     label: "UHC" },
        { key: "smp",     label: "SMP" },
        { key: "diasmp",  label: "DiaSMP" }
    ];

    /* ======================================================================
       1. INJECT CSS
       ====================================================================== */
    function injectStyles() {
        if (document.getElementById('player-search-styles')) return;

        const style = document.createElement('style');
        style.id = 'player-search-styles';
        style.textContent = `
.player-search-wrapper {
    margin-bottom: 32px;
}
.player-search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--color-bg-card, rgba(22,22,28,0.7));
    border: 1px solid var(--color-border, rgba(255,255,255,0.06));
    border-radius: 10px;
    padding: 12px 16px;
    transition: var(--transition-fast, 0.2s ease);
}
.player-search-box:focus-within {
    border-color: var(--color-border-hover, rgba(229,57,85,0.3));
    box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb, 229,57,85), 0.12);
}
.player-search-icon {
    flex-shrink: 0;
    color: var(--color-text-muted, #52525b);
}
.player-search-box:focus-within .player-search-icon {
    color: var(--color-accent, #e53935);
}
#player-search-input {
    flex: 1;
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text-primary, #ffffff);
    font-family: var(--font-sans, sans-serif);
    font-size: 0.95rem;
}
#player-search-input::placeholder {
    color: var(--color-text-muted, #52525b);
}
.player-search-status {
    margin-top: 10px;
    font-size: 0.85rem;
    color: var(--color-text-secondary, #a1a1aa);
    min-height: 1.2em;
}
.player-search-results {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.search-result-card {
    background: var(--color-bg-card, rgba(22,22,28,0.7));
    border: 1px solid var(--color-border, rgba(255,255,255,0.06));
    border-radius: 10px;
    padding: 16px 18px;
    transition: var(--transition-fast, 0.2s ease);
}
.search-result-card:hover {
    background: var(--color-bg-card-hover, rgba(30,30,38,0.85));
}
.search-result-card.is-unranked {
    border-style: dashed;
    opacity: 0.9;
}
.search-result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
}
.search-result-name {
    font-family: var(--font-display, sans-serif);
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--color-text-primary, #ffffff);
}
.search-result-name mark {
    background: rgba(var(--color-accent-rgb, 229,57,85), 0.35);
    color: var(--color-text-primary, #ffffff);
    border-radius: 3px;
    padding: 0 2px;
}
.search-result-points {
    font-family: var(--font-display, sans-serif);
    font-weight: 800;
    color: var(--color-accent, #e53935);
    font-size: 0.9rem;
    white-space: nowrap;
}
.search-result-note {
    margin-top: 6px;
    font-size: 0.8rem;
    color: var(--color-text-muted, #52525b);
    font-style: italic;
}
.search-tier-grid {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
}
.search-tier-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
}
.search-tier-label {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--color-text-muted, #52525b);
    font-family: var(--font-display, sans-serif);
}
.player-search-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    font-family: var(--font-display, sans-serif);
    text-align: center;
}
.player-search-dim { color: var(--color-text-muted, #52525b); }
.tier-ht1 { background-color: rgba(229, 57, 53, 0.15); color: #ef5350; border: 1px solid rgba(229, 57, 53, 0.3); }
.tier-lt1 { background-color: rgba(244, 67, 54, 0.1); color: #e57373; border: 1px solid rgba(244, 67, 54, 0.2); }
.tier-ht2 { background-color: rgba(156, 39, 176, 0.15); color: #ba68c8; border: 1px solid rgba(156, 39, 176, 0.3); }
.tier-lt2 { background-color: rgba(121, 85, 72, 0.15); color: #a1887f; border: 1px solid rgba(121, 85, 72, 0.3); }
.tier-ht3 { background-color: rgba(33, 150, 243, 0.15); color: #64b5f6; border: 1px solid rgba(33, 150, 243, 0.3); }
.tier-lt3 { background-color: rgba(0, 188, 212, 0.15); color: #4dd0e1; border: 1px solid rgba(0, 188, 212, 0.2); }
.tier-ht4 { background-color: rgba(255, 152, 0, 0.15); color: #ffb74d; border: 1px solid rgba(255, 152, 0, 0.3); }
.tier-lt4 { background-color: rgba(255, 235, 59, 0.1); color: #fff176; border: 1px solid rgba(255, 235, 59, 0.2); }
.tier-ht5 { background-color: rgba(76, 175, 80, 0.15); color: #81c784; border: 1px solid rgba(76, 175, 80, 0.3); }
.tier-lt5 { background-color: rgba(158, 158, 158, 0.15); color: #e0e0e0; border: 1px solid rgba(158, 158, 158, 0.3); }
@media (max-width: 600px) {
    .search-tier-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 400px) {
    .search-tier-grid { grid-template-columns: repeat(3, 1fr); }
}
        `;
        document.head.appendChild(style);
    }

    /* ======================================================================
       2. INJECT MARKUP
       ====================================================================== */
    function buildWrapperElement() {
        const wrapper = document.createElement('div');
        wrapper.className = 'player-search-wrapper';
        wrapper.innerHTML = `
            <div class="player-search-box">
                <svg class="player-search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="7"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" id="player-search-input" placeholder="Cari nama player..." autocomplete="off">
            </div>
            <div id="player-search-status" class="player-search-status"></div>
            <div id="player-search-results" class="player-search-results"></div>
        `;
        return wrapper;
    }

    function mountWidget() {
        // Kalau sudah pernah dipasang manual, jangan double-inject
        if (document.getElementById('player-search-input')) return;

        const wrapper = buildWrapperElement();

        // Prioritas 1: taruh tepat di atas tabel leaderboard (id dari ranking.js)
        const leaderboardBody = document.getElementById('leaderboard-rows-container');
        if (leaderboardBody) {
            const tableWrapper =
                leaderboardBody.closest('.table-card') ||
                leaderboardBody.closest('.table-wrapper') ||
                leaderboardBody.closest('table') ||
                leaderboardBody;
            tableWrapper.parentNode.insertBefore(wrapper, tableWrapper);
            return;
        }

        // Prioritas 2: mount point manual opsional -> <div id="player-search-mount"></div>
        const mountPoint = document.getElementById('player-search-mount');
        if (mountPoint) {
            mountPoint.appendChild(wrapper);
            return;
        }

        // Prioritas 3: awal <main>
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(wrapper, main.firstChild);
            return;
        }

        // Fallback terakhir: awal <body>
        document.body.insertBefore(wrapper, document.body.firstChild);
    }

    /* ======================================================================
       3. LOGIC PENCARIAN
       ====================================================================== */
    let allPlayers = [];
    let dataLoaded = false;
    let dataFailed = false;

    async function loadPlayers() {
        try {
            const response = await fetch(DATA_URL);
            if (!response.ok) {
                throw new Error(`Gagal memuat data (Status: ${response.status})`);
            }
            allPlayers = await response.json();
            dataLoaded = true;
        } catch (error) {
            console.error("Gagal memuat data player untuk pencarian:", error);
            dataFailed = true;
        }
    }

    function totalPoints(player) {
        let total = 0;
        for (const mode in player.tiers) {
            const tier = player.tiers[mode] ? player.tiers[mode].trim() : "—";
            total += TIER_POINTS[tier] || 0;
        }
        return total;
    }

    function isUnranked(player) {
        return totalPoints(player) === 0;
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function highlight(name, query) {
        const idx = name.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return escapeHtml(name);
        const before = escapeHtml(name.slice(0, idx));
        const match = escapeHtml(name.slice(idx, idx + query.length));
        const after = escapeHtml(name.slice(idx + query.length));
        return `${before}<mark>${match}</mark>${after}`;
    }

    function renderBadge(tierName) {
        if (!tierName || tierName === "—") {
            return `<span class="player-search-dim">—</span>`;
        }
        const cleanTier = tierName.trim().toLowerCase();
        return `<span class="player-search-badge tier-${cleanTier}">${escapeHtml(tierName)}</span>`;
    }

    function renderCard(player, query) {
        const unranked = isUnranked(player);
        const badgesHtml = GAMEMODES.map(gm => `
            <div class="search-tier-cell">
                <span class="search-tier-label">${gm.label}</span>
                ${renderBadge(player.tiers ? player.tiers[gm.key] : null)}
            </div>
        `).join('');

        return `
            <div class="search-result-card ${unranked ? 'is-unranked' : ''}">
                <div class="search-result-header">
                    <span class="search-result-name">${highlight(player.username || '(tanpa nama)', query)}</span>
                    <span class="search-result-points">${totalPoints(player)} pts</span>
                </div>
                ${unranked ? '<div class="search-result-note">Belum memiliki tier di kategori manapun &mdash; tidak muncul di leaderboard manapun.</div>' : ''}
                <div class="search-tier-grid">${badgesHtml}</div>
            </div>
        `;
    }

    function runSearch(rawQuery) {
        const statusBox = document.getElementById('player-search-status');
        const resultsBox = document.getElementById('player-search-results');
        if (!statusBox || !resultsBox) return;

        const query = (rawQuery || '').trim();

        if (!dataLoaded && !dataFailed) {
            statusBox.textContent = 'Memuat data player...';
            resultsBox.innerHTML = '';
            return;
        }
        if (dataFailed) {
            statusBox.textContent = 'Gagal memuat data player. Coba refresh halaman.';
            resultsBox.innerHTML = '';
            return;
        }
        if (query.length === 0) {
            statusBox.textContent = '';
            resultsBox.innerHTML = '';
            return;
        }
        if (query.length < 2) {
            statusBox.textContent = 'Ketik minimal 2 karakter...';
            resultsBox.innerHTML = '';
            return;
        }

        const lowerQuery = query.toLowerCase();
        const matches = allPlayers.filter(p =>
            p.username && p.username.toLowerCase().includes(lowerQuery)
        );

        if (matches.length === 0) {
            statusBox.textContent = `Tidak ada player bernama "${query}"`;
            resultsBox.innerHTML = '';
            return;
        }

        matches.sort((a, b) => totalPoints(b) - totalPoints(a));

        const shown = matches.slice(0, MAX_RESULTS);
        const extra = matches.length - shown.length;

        statusBox.textContent = extra > 0
            ? `${matches.length} player ditemukan (menampilkan ${shown.length} pertama)`
            : `${matches.length} player ditemukan`;
        resultsBox.innerHTML = shown.map(p => renderCard(p, query)).join('');
    }

    /* ======================================================================
       4. INIT
       ====================================================================== */
    function init() {
        injectStyles();
        mountWidget();

        const input = document.getElementById('player-search-input');
        if (!input) return;

        let debounceTimer = null;
        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const value = e.target.value;
            debounceTimer = setTimeout(() => runSearch(value), DEBOUNCE_MS);
        });

        loadPlayers().then(() => runSearch(input.value));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
