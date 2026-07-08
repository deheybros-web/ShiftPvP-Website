// 1. Matriks Referensi Poin Berdasarkan Tier
const TIER_POINTS = {
    "HT1": 20, "LT1": 18,
    "HT2": 16, "LT2": 14,
    "HT3": 12, "LT3": 10,
    "HT4": 8,  "LT4": 6,
    "HT5": 4,  "LT5": 2,
    "—": 0, "unranked": 0
};

// 2. Fungsi Utama untuk Memuat dan Memproses Data Leaderboard
async function loadLeaderboard() {
    const container = document.getElementById('leaderboard-rows-container');
    const loader = document.getElementById('ranking-loader');

    try {
        // Mengambil data players.json. 
        // Jika players.json berada di root folder (luar), gunakan '../players.json' atau '/players.json'
        // Jika ditaruh sejajar dengan index.html, gunakan 'players.json'
        const response = await fetch('data/players.json');
        
        if (!response.ok) {
            throw new Error(`Gagal memuat file JSON (Status: ${response.status})`);
        }

        const players = await response.json();

        // 3. Kalkulasi Total Poin untuk Setiap Player
        const processedPlayers = players.map(player => {
            let totalPoints = 0;
            // Menghitung jumlah poin dari seluruh gamemode yang ada di objek tiers
            for (const mode in player.tiers) {
                const tier = player.tiers[mode] ? player.tiers[mode].trim() : "—";
                totalPoints += TIER_POINTS[tier] || 0;
            }
            return {
                ...player,
                totalPoints: totalPoints
            };
        });

        // 4. Urutkan Player Berdasarkan Total Points Tertinggi (Sorting Otomatis)
        processedPlayers.sort((a, b) => b.totalPoints - a.totalPoints);

        // 5. Render HTML Baris Tabel secara Dinamis
        let htmlContent = '';
        processedPlayers.forEach((player, index) => {
            const rank = index + 1;
            
            // Tambahkan class khusus atau style pembeda untuk Top 3 besar
            let rankDisplay = rank;
            if (rank === 1) rankDisplay = `<span style="color: #ffd700; font-weight: 800;">#1</span>`;
            else if (rank === 2) rankDisplay = `<span style="color: #c0c0c0; font-weight: 700;">#2</span>`;
            else if (rank === 3) rankDisplay = `<span style="color: #cd7f32; font-weight: 700;">#3</span>`;
            else rankDisplay = `#${rank}`;

            htmlContent += `
                <tr>
                    <td class="font-weight-bold">${rankDisplay}</td>
                    <td class="font-weight-bold color-white">${player.username}</td>
                    <td class="text-center">${renderBadge(player.tiers.sword)}</td>
                    <td class="text-center">${renderBadge(player.tiers.nethpot)}</td>
                    <td class="text-center">${renderBadge(player.tiers.crystal)}</td>
                    <td class="text-center">${renderBadge(player.tiers.mace)}</td>
                    <td class="text-center">${renderBadge(player.tiers.uhc)}</td>
                    <td class="text-center">${renderBadge(player.tiers.smp)}</td>
                    <td class="text-center">${renderBadge(player.tiers.diasmp)}</td>
                    <td class="text-right font-weight-bold color-accent">${player.totalPoints}</td>
                </tr>
            `;
        });

        // Masukkan baris data ke dalam tabel
        if (container) {
            container.innerHTML = htmlContent;
        }

        // Sembunyikan elemen loader setelah data sukses ditampilkan
        if (loader) {
            loader.style.display = 'none';
        }

    } catch (error) {
        console.error("Error pada sistem ranking:", error);
        if (loader) {
            loader.innerHTML = `<span style="color: #ff4a4a;">Gagal memuat data leaderboard. Periksa konsol browser.</span>`;
        }
    }
}

// Helper untuk membuat elemen badge tier agar rapi dan memiliki class CSS yang sesuai
function renderBadge(tierName) {
    if (!tierName || tierName === "—") {
        return `<span class="color-dim">—</span>`;
    }
    const cleanTier = tierName.trim().toLowerCase();
    return `<span class="badge tier-${cleanTier}">${tierName}</span>`;
}

// Jalankan fungsi setelah seluruh dokumen HTML selesai di-load browser
document.addEventListener('DOMContentLoaded', loadLeaderboard);
