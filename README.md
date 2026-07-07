# Shift PvP — Minecraft PvP Tier List & Global Rankings

[![Platform: Web](https://img.shields.io/badge/platform-web-blue.svg)](https://shiftiers.vercel.app)
[![Hosting: Vercel](https://img.shields.io/badge/hosting-vercel-brightgreen.svg)](https://shiftiers.vercel.app)
[![Language: HTML/CSS/JS](https://img.shields.io/badge/language-HTML%20%7C%20CSS%20%7C%20JS-orange.svg)]()

Shift PvP is a competitive ranking platform and global tier list web application designed to track and display the performance of top-tier Minecraft PvP players across various gamemodes.

The website features client-side dynamic data rendering. It automatically calculates total cumulative points, updates player tier badges, and handles leaderboard sorting directly from a centralized database file upon page load.

🔗 **Live Demo:** [shiftiers.vercel.app](https://shiftiers.vercel.app)

---

## Key Features

* **Automated Leaderboard Sorting:** JavaScript handles point aggregation for each competitor, sorting the rankings from highest to lowest automatically in real time.
* **Dynamic Tier Badge Rendering:** Implements responsive visual status badges (ranging from HT1 to LT5) for each individual gamemode.
* **Optimized Data Architecture:** Utilizes a single tercentralized JSON data file (`players.json`) to minimize HTTP network request overhead and ensure fast page loading times.
* **Modern & Responsive UI:** Designed with high-end typography utilizing *Plus Jakarta Sans* and *Space Grotesk* fonts, fully optimized for both desktop and mobile layouts.

---

## Supported Gamemodes

The global ranking points are calculated based on verified placements across 7 distinct PvP combat disciplines:
1. **Sword** (1.16+ Classic Shield & Axe pacing)
2. **NethPot** (Netherite Potion combat)
3. **Crystal** (End Crystal meta and obsidian mechanics)
4. **Mace** (Vertical combat utilizing Wind Charges)
5. **UHC** (Ultra Hardcore healing and bow tracking)
6. **SMP** (Survival Multiplayer dynamic terrain skirmishes)
7. **Diamond SMP** (Mid-tier armor configurations)

---

## Point System & Grading Matrix

Global leaderboard points are cumulative and mapped directly from official tiers using the following point distribution matrix:

| Tier | Points | Tier | Points |
| :--- | :--- | :--- | :--- |
| **HT1** | 20 Points | **LT3** | 10 Points |
| **LT1** | 18 Points | **HT4** | 8 Points |
| **HT2** | 16 Points | **LT4** | 6 Points |
| **LT2** | 14 Points | **HT5** | 4 Points |
| **HT3** | 12 Points | **LT5** | 2 Points |

*Note: Unranked slots or empty placeholders (`—`) are automatically assigned a value of 0 points.*

---

## Repository Structure

```text
├── index.html          # Main application file (Dynamic Table Structure)
├── players.json        # Centralized JSON database for player profiles and tiers
├── rules/
│   └── rules.html      # Competition regulations page
├── assets/
│   ├── css/
│   │   └── style.css   # Main stylesheet containing layout definitions
│   ├── js/
│   │   ├── script.js   # Basic UI navigation and interactive effects
│   │   └── ranking.js  # Main script for point calculations, sorting, and DOM rendering
│   ├── icons/          # Visual assets representing gamemode iconography (.png)
│   └── logo/           # Shift PvP brand identity assets
└── README.md           # Repository documentation
