/**
 * Shift PvP - Client-Side Interactive Engine
 * Core Architecture Framework: Vanilla ECMAScript
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Core Elements Tracking
    const navbar = document.getElementById('mainNavbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const backToTopBtn = document.getElementById('backToTop');
    const scrollIndicator = document.getElementById('scrollIndicator');

    /* ==========================================================================
       1. STICKY NAVBAR MANAGEMENT
       ========================================================================== */
    const handleNavbarScroll = () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    
    // Fire on initialization to ensure correct status after refresh execution
    handleNavbarScroll();
    window.addEventListener('scroll', handleNavbarScroll);

    /* ==========================================================================
       2. MOBILE MENU INTERACTION OVERLAY
       ========================================================================== */
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent background page body scroll bleed while interactive overlay is rendering
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Terminate overlay if clicking document content canvas outside structural bounds
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close context mapping if viewport shifts bounds dynamically across break tokens
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    /* ==========================================================================
       3. BUTTON RIPPLE EMISSION METRIC
       ========================================================================== */
    const rippleButtons = document.querySelectorAll('.ripple');
    
    rippleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Setup coordination offsets
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Allocate DOM element structure instance
            const rippleCircle = document.createElement('span');
            rippleCircle.classList.add('ripple-effect');
            rippleCircle.style.left = `${x}px`;
            rippleCircle.style.top = `${y}px`;
            
            // Append and coordinate GC cleanup sequence handling
            this.appendChild(rippleCircle);
            
            rippleCircle.addEventListener('animationend', () => {
                rippleCircle.remove();
            });
        });
    });

    /* ==========================================================================
       4. BACK-TO-TOP FLOATING EMISSION MECHANICS
       ========================================================================== */
    const evaluateBackToTopStatus = () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
            if (scrollIndicator) scrollIndicator.style.opacity = '0';
        } else {
            backToTopBtn.classList.remove('visible');
            if (scrollIndicator) scrollIndicator.style.opacity = '0.6';
        }
    };

    window.addEventListener('scroll', evaluateBackToTopStatus);
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /* ==========================================================================
       5. ASYNCHRONOUS SCROLL REVEAL VIEWPORT DETECTOR (INTERSECTION OBSERVER)
       ========================================================================== */
    const targetRevealElements = document.querySelectorAll('.scroll-reveal');
    
    if ('IntersectionObserver' in window) {
        const revealOptions = {
            root: null, // Relative to device viewport bounds
            threshold: 0.05, // Trigger target emission execution at early visibility entry phase
            rootMargin: '0px 0px -40px 0px'
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Cease observations tracking once class context matches desired visual states
                    observer.unobserve(entry.target);
                }
            });
        }, revealOptions);

        targetRevealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        // Safe structural fallback mapping for legacy platform parameters compatibility
        targetRevealElements.forEach(element => {
            element.classList.add('revealed');
        });
    }
});
/* ==========================================================================
   6. DYNAMIC LEADERBOARD GENERATOR (MCTIERS & SWIFTIERS LAYOUT)
   ========================================================================== */

// 1. Definisikan data player langsung di sini (atau ganti dengan sumber data kamu)
const playersData = [
    {
        name: "ProPvPer_1",
        points: 2450,
        tiers: { sword: "HT1", nethpot: "LT1", crystal: "HT2", mace: "LT2", uhc: "HT3", smp: "—", diasmp: "HT1" }
    },
    {
        name: "ShadowWalker",
        points: 2120,
        tiers: { sword: "LT1", nethpot: "HT2", crystal: "LT1", mace: "—", uhc: "LT2", smp: "HT3", diasmp: "—" }
    },
    {
        name: "CrystalGod",
        points: 1980,
        tiers: { sword: "HT3", nethpot: "LT2", crystal: "HT1", mace: "HT1", uhc: "—", smp: "LT1", diasmp: "LT2" }
    },
    {
        name: "ShiftEnjoyer",
        points: 1540,
        tiers: { sword: "LT2", nethpot: "HT3", crystal: "LT3", mace: "LT3", uhc: "HT4", smp: "HT4", diasmp: "LT3" }
    }
];

// 2. Konfigurasi nama gamemode dan file icon/gambar asetnya
const gamemodeConfig = {
    sword: { name: 'Sword', icon: 'assets/icons/sword.png' },
    nethpot: { name: 'NethPot', icon: 'assets/icons/nethpot.png' },
    crystal: { name: 'Crystal', icon: 'assets/icons/crystal.png' },
    mace: { name: 'Mace', icon: 'assets/icons/mace.png' },
    uhc: { name: 'UHC', icon: 'assets/icons/uhc.png' },
    smp: { name: 'SMP', icon: 'assets/icons/smp.png' },
    diasmp: { name: 'Dia SMP', icon: 'assets/icons/diasmp.png' }
};

// 3. Fungsi utama untuk merender deretan baris leaderboard ke HTML
function renderNewLeaderboard(playersList) {
    const container = document.getElementById('leaderboard-rows-container');
    if (!container) return; // Keluar jika elemen container tidak ditemukan di HTML
    
    container.innerHTML = '';

    // Urutkan players berdasarkan poin tertinggi secara otomatis
    const sortedPlayers = [...playersList].sort((a, b) => b.points - a.points);

    sortedPlayers.forEach((player, index) => {
        const rank = index + 1;
        
        // Buat element baris (row) utama untuk player
        const row = document.createElement('div');
        row.className = `leaderboard-row rank-${rank <= 3 ? rank : 'normal'}`;

        // Kolom 1: Profil Player (Rank # dan Nama)
        const infoCell = document.createElement('div');
        infoCell.className = 'player-info-cell';
        infoCell.innerHTML = `
            <span class="p-rank">#${rank}</span>
            <span class="p-name">${player.name}</span>
        `;

        // Kolom 2: Breakdown Tiers Gamemode (Ikon + Nama Mode + Badge Tier)
        const tiersGrid = document.createElement('div');
        tiersGrid.className = 'player-tiers-grid';

        // Loop melintasi setiap gamemode yang dikonfigurasi
        Object.keys(gamemodeConfig).forEach(key => {
            const mode = gamemodeConfig[key];
            const playerTier = player.tiers && player.tiers[key] ? player.tiers[key] : '—';
            const isUnranked = playerTier === '—';
            const tierClass = isUnranked ? 'tier-unranked' : `tier-${playerTier.toLowerCase()}`;

            const tierItem = document.createElement('div');
            tierItem.className = 'tier-item';
            tierItem.innerHTML = `
                <img src="${mode.icon}" alt="${mode.name}" class="tier-icon" title="${mode.name}">
                <span class="tier-name">${mode.name}</span>
                <span class="tier-badge ${tierClass}">${playerTier}</span>
            `;
            tiersGrid.appendChild(tierItem);
        });

        // Kolom 3: Akumulasi Points Global Pemain
        const pointsCell = document.createElement('div');
        pointsCell.className = 'player-points-cell';
        pointsCell.textContent = `${player.points} PTS`;

        // Gabungkan seluruh struktur ke dalam baris utama, lalu masukkan ke container DOM
        row.appendChild(infoCell);
        row.appendChild(tiersGrid);
        row.appendChild(pointsCell);
        container.appendChild(row);
    });
}

// 4. Jalankan fungsi rendering secara otomatis saat halaman web selesai di-load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderNewLeaderboard(playersData));
} else {
    renderNewLeaderboard(playersData);
}
