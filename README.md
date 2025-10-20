<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shiny Nat Dex Tracker - Pokémon Home</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            transition: background-color 0.3s, color 0.3s;
        }
        body.light {
            background: #f0f0f0;
            color: #333;
        }
        body.dark {
            background: #1a1a1a;
            color: #e0e0e0;
        }
        h1 {
            text-align: center;
            color: #ff6b6b;
        }
        #search {
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        body.dark #search {
            background: #333;
            color: #e0e0e0;
            border-color: #555;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        body.light table {
            background: white;
        }
        body.dark table {
            background: #2a2a2a;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #444;
        }
        body.light th {
            background: #4ecdc4;
            color: white;
        }
        body.dark th {
            background: #2c6e67;
            color: #e0e0e0;
        }
        th {
            cursor: pointer;
        }
        img {
            width: 64px;
            height: 64px;
            image-rendering: pixelated;
        }
        input[type="checkbox"] {
            transform: scale(1.5);
        }
        button {
            background: #45b7d1;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            margin: 0 2px;
        }
        button:hover {
            background: #96c93d;
        }
        .attempts {
            font-weight: bold;
            color: #ff6b6b;
        }
        .location {
            font-size: 0.9em;
            max-width: 200px;
            word-wrap: break-word;
        }
        body.light .location {
            color: #666;
        }
        body.dark .location {
            color: #aaa;
        }
        .progress {
            text-align: center;
            margin: 20px;
            font-size: 18px;
        }
        .export-import {
            text-align: center;
            margin: 10px;
        }
        input[type="file"] {
            margin: 0 10px;
        }
        #themeToggle {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px;
            font-size: 16px;
        }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            justify-content: center;
            align-items: center;
        }
        .modal-content {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            width: 400px;
            max-width: 90%;
        }
        body.dark .modal-content {
            background: #333;
            color: #e0e0e0;
        }
        .modal-content select, .modal-content input {
            width: 100%;
            padding: 8px;
            margin: 10px 0;
        }
        body.dark .modal-content select, body.dark .modal-content input {
            background: #444;
            color: #e0e0e0;
            border: 1px solid #555;
        }
        .modal-content button {
            width: 100%;
            margin-top: 10px;
        }
        .close {
            float: right;
            cursor: pointer;
            font-size: 20px;
        }
    </style>
</head>
<body class="light">
    <button id="themeToggle">Switch to Dark Mode</button>
    <h1>Shiny Nat Dex Tracker</h1>
    <input type="text" id="search" placeholder="Search by name or number...">
    <div class="export-import">
        <button onclick="exportData()">Export Progress</button>
        <input type="file" id="importFile" accept=".json" onchange="importData(event)">
        <button onclick="document.getElementById('importFile').click()">Import Progress</button>
        <button onclick="openOddsCalculator()">Odds Calculator</button>
    </div>
    <table id="pokedexTable">
        <thead>
            <tr>
                <th onclick="sortTable(0)">#</th>
                <th onclick="sortTable(1)">Name</th>
                <th>Shiny Image</th>
                <th>Caught?</th>
                <th>Location</th>
                <th>Attempts <button onclick="resetAllAttempts()">Reset All</button></th>
            </tr>
        </thead>
        <tbody id="tableBody">
            <!-- Pokémon data populated by JS -->
        </tbody>
    </table>
    <div id="progress" class="progress">Caught: 0 / 1010</div>

    <div id="oddsModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeOddsCalculator()">&times;</span>
            <h2>Shiny Odds Calculator</h2>
            <select id="gameSelect">
                <option value="violet">Violet/Scarlet</option>
                <option value="bdsp">Brilliant Diamond/Shining Pearl</option>
                <option value="shield">Sword/Shield</option>
                <option value="lgp">Let's Go Pikachu</option>
                <option value="usum">Ultra Sun/Ultra Moon</option>
                <option value="sm">Sun/Moon</option>
                <option value="oras">Omega Ruby/Alpha Sapphire</option>
                <option value="bw2">Black 2/White 2</option>
                <option value="bw">Black/White</option>
                <option value="hgss">HeartGold/SoulSilver</option>
                <option value="platinum">Platinum</option>
                <option value="emerald">Emerald</option>
                <option value="fr">FireRed/LeafGreen</option>
                <option value="sapphire">Ruby/Sapphire</option>
            </select>
            <select id="methodSelect">
                <option value="full">Full Odds</option>
                <option value="masuda">Masuda Method</option>
                <option value="charm">Shiny Charm</option>
                <option value="masuda_charm">Masuda + Shiny Charm</option>
                <option value="sos">SOS Battles (SM/USUM)</option>
                <option value="chain_fish">Chain Fishing (ORAS)</option>
                <option value="dexnav">DexNav (ORAS)</option>
                <option value="radar">Poké Radar (BDSP/Platinum)</option>
                <option value="outbreak">Mass Outbreak (Violet/Shield)</option>
                <option value="combo">Catch Combo (LGP)</option>
            </select>
            <input type="number" id="attemptsInput" placeholder="Number of attempts" min="0">
            <button onclick="calculateOdds()">Calculate</button>
            <p id="oddsResult"></p>
        </div>
    </div>

    <script>
        // National Dex data (abridged; full list in production)
        const pokemonData = [
            { num: 1, name: 'Bulbasaur', image: 'https://www.serebii.net/Shiny/Home/001.png', location: 'Breed in Violet (Shield egg); Route 1 (Violet wild)', caught: false, attempts: 0 },
            { num: 2, name: 'Ivysaur', image: 'https://www.serebii.net/Shiny/Home/002.png', location: 'Evolves from Bulbasaur', caught: false, attempts: 0 },
            { num: 3, name: 'Venusaur', image: 'https://www.serebii.net/Shiny/Home/003.png', location: 'Evolves from Ivysaur', caught: false, attempts: 0 },
            // ... (full 1010 entries from Bulbapedia/Serebii)
            { num: 1010, name: 'Calyrex', image: 'https://www.serebii.net/Shiny/Home/898.png', location: 'Not in owned games; Transfer from Home', caught: false, attempts: 0 }
        ];

        let data = JSON.parse(localStorage.getItem('shinyTracker')) || pokemonData;
        let sortDirection = {};

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.replace('light', 'dark');
            themeToggle.textContent = 'Switch to Light Mode';
        }
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light');
            document.body.classList.toggle('dark');
            const isDark = document.body.classList.contains('dark');
            themeToggle.textContent = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        // Odds Calculator
        const oddsData = {
            violet: { full: 1/4096, charm: 1/1365.33, outbreak: 1/512, masuda: 1/683, masuda_charm: 1/512 },
            bdsp: { full: 1/4096, charm: 1/1365.33, radar: 1/200, masuda: 1/683, masuda_charm: 1/512 },
            shield: { full: 1/4096, charm: 1/1365.33, outbreak: 1/512, masuda: 1/683, masuda_charm: 1/512 },
            lgp: { full: 1/4096, charm: 1/1365.33, combo: 1/341.33, masuda: 1/683, masuda_charm: 1/512 },
            usum: { full: 1/4096, charm: 1/1365.33, sos: 1/315, masuda: 1/683, masuda_charm: 1/512 },
            sm: { full: 1/4096, charm: 1/1365.33, sos: 1/315, masuda: 1/683, masuda_charm: 1/512 },
            oras: { full: 1/4096, charm: 1/1365.33, chain_fish: 1/100, dexnav: 1/200, masuda: 1/683, masuda_charm: 1/512 },
            bw2: { full: 1/8192, charm: 1/2370.67, masuda: 1/1365.33, masuda_charm: 1/1024 },
            bw: { full: 1/8192, charm: 1/2370.67, masuda: 1/1365.33, masuda_charm: 1/1024 },
            hgss: { full: 1/8192, charm: 1/2370.67, masuda: 1/1365.33, masuda_charm: 1/1024 },
            platinum: { full: 1/8192, charm: 1/2370.67, radar: 1/200, masuda: 1/1365.33, masuda_charm: 1/1024 },
            emerald: { full: 1/8192 },
            fr: { full: 1/8192 },
            sapphire: { full: 1/8192 }
        };

        function openOddsCalculator() {
            document.getElementById('oddsModal').style.display = 'flex';
        }

        function closeOddsCalculator() {
            document.getElementById('oddsModal').style.display = 'none';
        }

        function calculateOdds() {
            const game = document.getElementById('gameSelect').value;
            const method = document.getElementById('methodSelect').value;
            const attempts = parseInt(document.getElementById('attemptsInput').value) || 0;
            const odds = oddsData[game][method] || 1/4096;
            const probability = 1 - Math.pow(1 - odds, attempts);
            document.getElementById('oddsResult').textContent = `Odds: ${odds.toFixed(4)} | Chance after ${attempts} attempts: ${(probability * 100).toFixed(2)}%`;
        }

        function renderTable(filteredData = data) {
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = filteredData.map(p => `
                <tr>
                    <td>${p.num}</td>
                    <td>${p.name}</td>
                    <td><img src="${p.image}" alt="${p.name} shiny" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${p.num}.png'"></td>
                    <td><input type="checkbox" ${p.caught ? 'checked' : ''} onchange="toggleCaught(${p.num-1}, this.checked)"></td>
                    <td class="location">${p.location}</td>
                    <td class="attempts">${p.attempts} <button onclick="incrementAttempts(${p.num-1})">+</button><button onclick="decrementAttempts(${p.num-1})">−</button></td>
                </tr>
            `).join('');
            updateProgress();
        }

        function toggleCaught(index, caught) {
            data[index].caught = caught;
            saveData();
            renderTable();
        }

        function incrementAttempts(index) {
            data[index].attempts++;
            saveData();
            renderTable();
        }

        function decrementAttempts(index) {
            if (data[index].attempts > 0) {
                data[index].attempts--;
                saveData();
                renderTable();
            }
        }

        function resetAllAttempts() {
            data.forEach(p => p.attempts = 0);
            saveData();
            renderTable();
        }

        function sortTable(col) {
            const dir = sortDirection[col] === 'asc' ? 'desc' : 'asc';
            data.sort((a, b) => {
                let valA, valB;
                if (col === 0) {
                    valA = a.num;
                    valB = b.num;
                } else if (col === 1) {
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                } else if (col === 4) {
                    valA = a.location.toLowerCase();
                    valB = b.location.toLowerCase();
                } else {
                    valA = a.attempts || 0;
                    valB = b.attempts || 0;
                }
                if (dir === 'asc') return valA > valB ? 1 : -1;
                return valA < valB ? 1 : -1;
            });
            sortDirection[col] = dir;
            renderTable();
        }

        function searchTable() {
            const query = document.getElementById('search').value.toLowerCase();
            const filtered = data.filter(p => p.name.toLowerCase().includes(query) || p.num.toString().includes(query));
            renderTable(filtered);
        }

        function updateProgress() {
            const caught = data.filter(p => p.caught).length;
            document.getElementById('progress').textContent = `Caught: ${caught} / ${data.length}`;
        }

        function saveData() {
            localStorage.setItem('shinyTracker', JSON.stringify(data));
        }

        function exportData() {
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'shiny-tracker.json';
            a.click();
        }

        function importData(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = e => {
                    data = JSON.parse(e.target.result);
                    saveData();
                    renderTable();
                };
                reader.readAsText(file);
            }
        }

        document.getElementById('search').addEventListener('input', searchTable);
        renderTable();
    </script>
</body>
</html>
