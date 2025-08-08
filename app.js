<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pineapple Poker Equity Calculator</title>
    <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f5132 0%, #198754 100%);
            min-height: 100vh;
            color: white;
        }
        
        .header {
            text-align: center;
            padding: 40px 20px;
            background: rgba(0,0,0,0.3);
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .calculator-section {
            background: white;
            color: #333;
            border-radius: 15px;
            padding: 40px;
            margin: 30px 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        .players-container {
            display: flex;
            justify-content: space-around;
            margin-bottom: 40px;
            gap: 20px;
        }
        
        .player-section {
            text-align: center;
            flex: 1;
        }
        
        .player-section h3 {
            color: #2c5aa0;
            margin-bottom: 20px;
            font-size: 1.5rem;
        }
        
        .player-2 h3 {
            color: #dc3545;
        }
        
        .card-row {
            display: flex;
            justify-content: center;
            gap: 10px;
        }
        
        .card {
            width: 60px;
            height: 84px;
            border: 2px solid #ddd;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .card:hover {
            border-color: #007bff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .card.empty {
            border-style: dashed;
            border-color: #ccc;
            background: #f8f9fa;
        }
        
        .rank {
            font-size: 16px;
            font-weight: bold;
        }
        
        .suit {
            font-size: 20px;
        }
        
        .red { color: #dc3545; }
        .black { color: #333; }
        
        .community-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .community-section h3 {
            color: #495057;
            margin-bottom: 20px;
        }
        
        .controls {
            text-align: center;
            margin: 30px 0;
        }
        
        .controls select {
            padding: 10px 15px;
            margin: 0 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        
        .button-group {
            text-align: center;
            margin: 30px 0;
        }
        
        button {
            padding: 15px 30px;
            margin: 0 10px;
            font-size: 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
        }
        
        .btn-primary {
            background: #28a745;
            color: white;
        }
        
        .btn-primary:hover {
            background: #218838;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #545b62;
        }
        
        .loading {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .status {
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
            font-weight: 500;
        }
        
        .loading-status {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        
        .error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f1aeb5;
        }
        
        .success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .results {
            margin: 30px 0;
            padding: 30px;
            background: #e9ecef;
            border-radius: 12px;
        }
        
        .equity-display {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            text-align: center;
        }
        
        .equity-item h4 {
            color: #666;
            margin-bottom: 10px;
        }
        
        .equity-value {
            font-size: 2rem;
            font-weight: bold;
        }
        
        .player1-equity { color: #2c5aa0; }
        .player2-equity { color: #dc3545; }
        .ties-equity { color: #6c757d; }
        
        .info-section {
            background: rgba(255,255,255,0.95);
            color: #333;
            border-radius: 15px;
            padding: 40px;
            margin: 30px 0;
        }
        
        .info-section h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #2c5aa0;
        }
        
        .info-content {
            line-height: 1.6;
        }
        
        .info-content h4 {
            color: #495057;
            margin: 20px 0 10px 0;
        }
        
        .info-content ul {
            margin-left: 20px;
            margin-bottom: 15px;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }
        
        .modal.show {
            display: flex;
        }
        
        .modal-content {
            background: white;
            color: #333;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        }
        
        .modal h3 {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .close-btn {
            position: absolute;
            top: 15px;
            right: 20px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        }
        
        .suit-header {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
            text-align: center;
            font-size: 24px;
        }
        
        .card-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .card-option {
            aspect-ratio: 2/3;
            border: 2px solid #ddd;
            border-radius: 6px;
            background: white;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            font-size: 14px;
        }
        
        .card-option:hover {
            border-color: #007bff;
            transform: scale(1.05);
        }
        
        .card-option.disabled {
            background: #f5f5f5;
            color: #ccc;
            cursor: not-allowed;
            opacity: 0.5;
        }
        
        .remove-card {
            width: 100%;
            background: #dc3545;
            color: white;
            padding: 12px;
            margin-top: 20px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🃏 Pineapple Poker Equity Calculator</h1>
        <p>Calculate pre-flop and post-flop equity for Pineapple Hold'em hands</p>
    </div>
    
    <div class="container">
        <div class="calculator-section">
            <div class="players-container">
                <div class="player-section">
                    <h3>👤 Player 1</h3>
                    <div class="card-row">
                        <div class="card empty" data-player="1" data-index="0" onclick="openCardSelector(this)">
                            <div class="rank">?</div>
                        </div>
                        <div class="card empty" data-player="1" data-index="1" onclick="openCardSelector(this)">
                            <div class="rank">?</div>
                        </div>
                        <div class="card empty" data-player="1" data-index="2" onclick="openCardSelector(this)">
                            <div class="rank">?</div>
                        </div>
                    </div>
                </div>
                
                <div class="player-section player-2">
                    <h3>👤 Player 2</h3>
                    <div class="card-row">
                        <div class="card empty" data-player="2" data-index="0" onclick="openCardSelector(this)">
                            <div class="rank">?</div>
                        </div>
                        <div class="card empty" data-player="2" data-index="1" onclick="openCardSelector(this)">
                            <div class="rank">?</div>
                        </div>
                        <div class="card empty" data-player="2" data-index="2" onclick="openCardSelector(this)">
                            <div class="rank">?</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="community-section">
                <h3>🏛️ Community Cards (Optional)</h3>
                <div class="card-row">
                    <div class="card empty" data-player="community" data-index="0" onclick="openCardSelector(this)">
                        <div class="rank">?</div>
                    </div>
                    <div class="card empty" data-player="community" data-index="1" onclick="openCardSelector(this)">
                        <div class="rank">?</div>
                    </div>
                    <div class="card empty" data-player="community" data-index="2" onclick="openCardSelector(this)">
                        <div class="rank">?</div>
                    </div>
                    <div class="card empty" data-player="community" data-index="3" onclick="openCardSelector(this)">
                        <div class="rank">?</div>
                    </div>
                    <div class="card empty" data-player="community" data-index="4" onclick="openCardSelector(this)">
                        <div class="rank">?</div>
                    </div>
                </div>
            </div>
            
            <div class="controls">
                <label for="simulations">Simulations:</label>
                <select id="simulations">
                    <option value="10000">10,000 (Fast)</option>
                    <option value="50000" selected>50,000 (Balanced)</option>
                    <option value="100000">100,000 (Precise)</option>
                </select>
            </div>
            
            <div class="button-group">
                <button id="calculateBtn" class="btn-primary" onclick="calculateEquity()">
                    Calculate Equity
                </button>
                <button class="btn-secondary" onclick="clearAll()">
                    Clear All
                </button>
            </div>
            
            <div id="status"></div>
            <div id="results"></div>
        </div>
        
        <!-- Pineapple Poker Info -->
        <div class="info-section">
            <h2>📚 About Pineapple Hold'em Poker</h2>
            
            <div class="info-content">
                <h4>🃏 How It Works</h4>
                <ul>
                    <li><strong>3 Hole Cards:</strong> Each player gets 3 cards instead of 2</li>
                    <li><strong>Discard Decision:</strong> Must discard 1 card before the flop</li>
                    <li><strong>More Action:</strong> Creates bigger pots and more drawing opportunities</li>
                    <li><strong>Strategy Shift:</strong> Hand selection becomes more complex and important</li>
                </ul>
                
                <h4>🎯 Key Strategy Points</h4>
                <ul>
                    <li><strong>Pocket Pairs:</strong> Increase in value due to set potential</li>
                    <li><strong>Suited Connectors:</strong> Much stronger due to straight/flush draws</li>
                    <li><strong>Position Matters:</strong> You see opponents' discards before deciding</li>
                    <li><strong>Drawing Hands:</strong> More valuable than in regular Hold'em</li>
                </ul>
                
                <h4>🧮 This Calculator</h4>
                <ul>
                    <li><strong>Monte Carlo Simulation:</strong> Uses proven statistical methods</li>
                    <li><strong>All Combinations:</strong> Tests all possible 2-card selections from your 3-card hand</li>
                    <li><strong>Accurate Results:</strong> 50,000+ simulations provide reliable equity estimates</li>
                    <li><strong>Post-Flop Analysis:</strong> Add community cards to see how equity changes</li>
                </ul>
                
                <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
                    <h4 style="color: #1976d2;">💡 Pro Tip</h4>
                    <p>Pre-flop equity shows raw hand strength, but post-flop equity reveals how board texture affects your chances. Use this tool to study common scenarios and improve your Pineapple decision-making!</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Card Selector Modal -->
    <div id="cardModal" class="modal">
        <div class="modal-content">
            <button class="close-btn" onclick="closeCardSelector()">×</button>
            <h3>Select Card</h3>
            
            <div class="suit-header">
                <div class="black">♠</div>
                <div class="red">♥</div>
                <div class="red">♦</div>
                <div class="black">♣</div>
            </div>
            
            <div class="card-grid" id="cardGrid"></div>
            
            <button class="remove-card" onclick="removeCard()" id="removeBtn" style="display: none;">
                Remove Card
            </button>
        </div>
    </div>

    <script>
        let pyodide;
        let isInitialized = false;
        let isCalculating = false;
        let currentCardElement = null;
        
        const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
        const suits = [
            { symbol: '♠', value: 's', color: 'black' },
            { symbol: '♥', value: 'h', color: 'red' },
            { symbol: '♦', value: 'd', color: 'red' },
            { symbol: '♣', value: 'c', color: 'black' }
        ];
        
        async function initializePyodide() {
            if (isInitialized) return;
            
            showStatus('🐍 Loading Python environment...', 'loading-status');
            
            try {
                pyodide = await loadPyodide();
                await pyodide.loadPackage(['numpy']);
                
                showStatus('📁 Loading your Python modules...', 'loading-status');
                
                // Try to load your Python files
                try {
                    const cardsetResponse = await fetch('./python/Cardset.py');
                    const cardsetCode = await cardsetResponse.text();
                    pyodide.runPython(cardsetCode);
                    console.log('✅ Loaded Cardset.py');
                } catch (e) {
                    console.log('⚠️ Could not load Cardset.py:', e.message);
                }
                
                try {
                    const playerResponse = await fetch('./python/player.py');
                    const playerCode = await playerResponse.text();
                    pyodide.runPython(playerCode);
                    console.log('✅ Loaded player.py');
                } catch (e) {
                    console.log('⚠️ Could not load player.py:', e.message);
                }
                
                try {
                    const tempPlayerResponse = await fetch('./python/temp_player.py');
                    const tempPlayerCode = await tempPlayerResponse.text();
                    pyodide.runPython(tempPlayerCode);
                    console.log('✅ Loaded temp_player.py');
                } catch (e) {
                    console.log('⚠️ Could not load temp_player.py:', e.message);
                }
                
                try {
                    const evaluatorResponse = await fetch('./python/evaluator.py');
                    const evaluatorCode = await evaluatorResponse.text();
                    pyodide.runPython(evaluatorCode);
                    console.log('✅ Loaded evaluator.py');
                } catch (e) {
                    console.log('⚠️ Could not load evaluator.py:', e.message);
                }
                
                try {
                    const monteCarloResponse = await fetch('./python/monte_carlo.py');
                    const monteCarloCode = await monteCarloResponse.text();
                    pyodide.runPython(monteCarloCode);
                    console.log('✅ Loaded monte_carlo.py');
                } catch (e) {
                    console.log('⚠️ Could not load monte_carlo.py:', e.message);
                }
                
                // Add wrapper function
                pyodide.runPython(`
def calculate_web_equity(p1_cards, p2_cards, community_cards=[], sims=50000):
    try:
        import monte_carlo as mc
        from Cardset import Cardset
        from player import Player
        
        deck = Cardset()
        hero = Player()
        villain = Player()
        
        hero.set_cards(p1_cards, deck)
        villain.set_cards(p2_cards, deck)
        
        if len(community_cards) > 0:
            deck.set_community_cards(community_cards)
            results = mc.estimate_equity(hero, villain, deck, sims, num_cards=len(community_cards), set_board=community_cards)
        else:
            results = mc.estimate_equity(hero, villain, deck, sims)
        
        return {
            'player1_equity': float(results[0]),
            'player2_equity': float(results[1]),
            'ties': float(results[2]),
            'simulations': sims
        }
    except Exception as e:
        return {'error': str(e)}
                `);
                
                isInitialized = true;
                showStatus('✅ Ready! Click cards to select them.', 'success');
                
            } catch (error) {
                showStatus('❌ Failed to load: ' + error.message, 'error');
                console.error('Error:', error);
            }
        }
        
        function openCardSelector(cardElement) {
            currentCardElement = cardElement;
            generateCardOptions();
            
            const removeBtn = document.getElementById('removeBtn');
            const hasCard = !cardElement.classList.contains('empty');
            removeBtn.style.display = hasCard ? 'block' : 'none';
            
            document.getElementById('cardModal').classList.add('show');
        }
        
        function closeCardSelector() {
            document.getElementById('cardModal').classList.remove('show');
            currentCardElement = null;
        }
        
        function generateCardOptions() {
            const cardGrid = document.getElementById('cardGrid');
            cardGrid.innerHTML = '';
            
            const usedCards = getUsedCards();
            
            ranks.forEach(rank => {
                suits.forEach(suit => {
                    const card = rank + suit.value;
                    const isUsed = usedCards.includes(card);
                    
                    const cardDiv = document.createElement('div');
                    cardDiv.className = `card-option ${suit.color}${isUsed ? ' disabled' : ''}`;
                    cardDiv.innerHTML = `<div><strong>${rank}</strong></div><div>${suit.symbol}</div>`;
                    
                    if (!isUsed) {
                        cardDiv.onclick = () => selectCard(card);
                    }
                    
                    cardGrid.appendChild(cardDiv);
                });
            });
        }
        
        function selectCard(card) {
            if (currentCardElement) {
                const rank = card[0];
                const suit = card[1];
                const suitInfo = suits.find(s => s.value === suit);
                
                currentCardElement.innerHTML = `
                    <div class="rank ${suitInfo.color}">${rank}</div>
                    <div class="suit ${suitInfo.color}">${suitInfo.symbol}</div>
                `;
                currentCardElement.classList.remove('empty');
                currentCardElement.dataset.card = card;
            }
            closeCardSelector();
        }
        
        function removeCard() {
            if (currentCardElement) {
                currentCardElement.innerHTML = '<div class="rank">?</div>';
                currentCardElement.classList.add('empty');
                delete currentCardElement.dataset.card;
            }
            closeCardSelector();
        }
        
        function getUsedCards() {
            const cards = [];
            document.querySelectorAll('.card[data-card]').forEach(cardEl => {
                if (cardEl.dataset.card) {
                    cards.push(cardEl.dataset.card);
                }
            });
            return cards;
        }
        
        function getPlayerCards(player) {
            const cards = [];
            document.querySelectorAll(`[data-player="${player}"]`).forEach(cardEl => {
                if (cardEl.dataset.card) {
                    cards.push(cardEl.dataset.card);
                }
            });
            return cards;
        }
        
        async function calculateEquity() {
            if (isCalculating) return;
            if (!isInitialized) await initializePyodide();
            
            isCalculating = true;
            const btn = document.getElementById('calculateBtn');
            btn.textContent = 'Calculating...';
            btn.classList.add('loading');
            
            try {
                const p1Cards = getPlayerCards('1');
                const p2Cards = getPlayerCards('2');
                const communityCards = getPlayerCards('community');
                const simulations = parseInt(document.getElementById('simulations').value);
                
                if (p1Cards.length !== 3 || p2Cards.length !== 3) {
                    throw new Error('Both players need exactly 3 cards');
                }
                
                showStatus(`🎲 Running ${simulations.toLocaleString()} simulations...`, 'loading-status');
                
                pyodide.globals.set("p1_cards", p1Cards);
                pyodide.globals.set("p2_cards", p2Cards);
                pyodide.globals.set("community_cards", communityCards);
                pyodide.globals.set("num_sims", simulations);
                
                const results = pyodide.runPython('calculate_web_equity(p1_cards, p2_cards, community_cards, num_sims)');
                
                if (results.error) {
                    throw new Error(results.error);
                }
                
                displayResults(results, p1Cards, p2Cards);
                showStatus('✅ Calculation complete!', 'success');
                
            } catch (error) {
                showStatus('❌ Error: ' + error.message, 'error');
                console.error('Error:', error);
            } finally {
                isCalculating = false;
                btn.textContent = 'Calculate Equity';
                btn.classList.remove('loading');
            }
        }
        
        function displayResults(results, p1Cards, p2Cards) {
            const p1Pct = (results.player1_equity * 100).toFixed(1);
            const p2Pct = (results.player2_equity * 100).toFixed(1);
            const tiePct = (results.ties * 100).toFixed(1);
            
            document.getElementById('results').innerHTML = `
                <div class="results">
                    <h3>📊 Equity Results</h3>
                    <div class="equity-display">
                        <div class="equity-item">
                            <h4>Player 1</h4>
                            <div class="equity-value player1-equity">${p1Pct}%</div>
                            <small>${p1Cards.join(' ')}</small>
                        </div>
                        <div class="equity-item">
                            <h4>Player 2</h4>
                            <div class="equity-value player2-equity">${p2Pct}%</div>
                            <small>${p2Cards.join(' ')}</small>
                        </div>
                        <div class="equity-item">
                            <h4>Ties</h4>
                            <div class="equity-value ties-equity">${tiePct}%</div>
                            <small>Split pot</small>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
                        Based on ${results.simulations.toLocaleString()} simulations
                    </div>
                </div>
            `;
        }
        
        function showStatus(message, className = '') {
            document.getElementById('status').innerHTML = `<div class="status ${className}">${message}</div>`;
        }
        
        function clearAll() {
            document.querySelectorAll('.card').forEach(card => {
                card.innerHTML = '<div class="rank">?</div>';
                card.classList.add('empty');
                delete card.dataset.card;
            });
            document.getElementById('results').innerHTML = '';
            document.getElementById('status').innerHTML = '';
        }
        
        // Initialize when page loads
        window.addEventListener('load', () => {
            setTimeout(initializePyodide, 1000);
        });
        
        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('cardModal');
            if (event.target === modal) {
                closeCardSelector();
            }
        }
    </script>
</body>
</html>