<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pineapple Poker Equity Calculator</title>
    <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #0f5132 0%, #198754 100%);
            min-height: 100vh;
            margin: 0;
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
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .calculator {
            background: white;
            color: #333;
            border-radius: 15px;
            padding: 40px;
            margin: 30px 0;
        }
        
        .players {
            display: flex;
            justify-content: space-around;
            margin-bottom: 40px;
            gap: 20px;
        }
        
        .player {
            text-align: center;
            flex: 1;
        }
        
        .player h3 {
            margin-bottom: 20px;
            font-size: 1.5rem;
        }
        
        .player1 h3 {
            color: #2c5aa0;
        }
        
        .player2 h3 {
            color: #dc3545;
        }
        
        .cards {
            display: flex;
            justify-content: center;
            gap: 10px;
        }
        
        .card {
            width: 60px;
            height: 84px;
            border: 2px dashed #ccc;
            border-radius: 8px;
            background: #f8f9fa;
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
        }
        
        .card.filled {
            border: 2px solid #28a745;
            background: white;
        }
        
        .community {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .community h3 {
            color: #495057;
            margin-bottom: 20px;
        }
        
        .controls {
            text-align: center;
            margin: 30px 0;
        }
        
        .controls select {
            padding: 10px;
            margin: 0 10px;
            border-radius: 5px;
            border: 1px solid #ddd;
        }
        
        .buttons {
            text-align: center;
            margin: 30px 0;
        }
        
        button {
            padding: 15px 30px;
            margin: 0 10px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
        }
        
        .btn-green {
            background: #28a745;
            color: white;
        }
        
        .btn-gray {
            background: #6c757d;
            color: white;
        }
        
        .btn-green:hover {
            background: #218838;
        }
        
        .status {
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
        }
        
        .loading {
            background: #fff3cd;
            color: #856404;
        }
        
        .success {
            background: #d4edda;
            color: #155724;
        }
        
        .error {
            background: #f8d7da;
            color: #721c24;
        }
        
        .results {
            margin: 30px 0;
            padding: 30px;
            background: #e9ecef;
            border-radius: 12px;
        }
        
        .results h3 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
        }
        
        .equity-row {
            display: flex;
            justify-content: space-around;
            text-align: center;
            margin: 20px 0;
        }
        
        .equity-item {
            flex: 1;
        }
        
        .equity-value {
            font-size: 2rem;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .p1-equity { color: #2c5aa0; }
        .p2-equity { color: #dc3545; }
        .tie-equity { color: #6c757d; }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
        }
        
        .modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
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
        }
        
        .card-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin: 20px 0;
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
        
        .red { color: #dc3545; }
        .black { color: #333; }
        
        .info {
            background: rgba(255,255,255,0.95);
            color: #333;
            border-radius: 15px;
            padding: 40px;
            margin: 30px 0;
        }
        
        .info h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #2c5aa0;
        }
        
        .info h4 {
            color: #495057;
            margin: 20px 0 10px 0;
        }
        
        .info ul {
            margin: 10px 0 20px 20px;
        }
        
        .info li {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🃏 Pineapple Poker Equity Calculator</h1>
        <p>Calculate pre-flop and post-flop equity for Pineapple Hold'em hands</p>
    </div>
    
    <div class="container">
        <div class="calculator">
            <div class="players">
                <div class="player player1">
                    <h3>Player 1</h3>
                    <div class="cards">
                        <div class="card" data-player="1" data-index="0" onclick="openSelector(this)">
                            <div>?</div>
                        </div>
                        <div class="card" data-player="1" data-index="1" onclick="openSelector(this)">
                            <div>?</div>
                        </div>
                        <div class="card" data-player="1" data-index="2" onclick="openSelector(this)">
                            <div>?</div>
                        </div>
                    </div>
                </div>
                
                <div class="player player2">
                    <h3>Player 2</h3>
                    <div class="cards">
                        <div class="card" data-player="2" data-index="0" onclick="openSelector(this)">
                            <div>?</div>
                        </div>
                        <div class="card" data-player="2" data-index="1" onclick="openSelector(this)">
                            <div>?</div>
                        </div>
                        <div class="card" data-player="2" data-index="2" onclick="openSelector(this)">
                            <div>?</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="community">
                <h3>Community Cards (Optional)</h3>
                <div class="cards">
                    <div class="card" data-player="community" data-index="0" onclick="openSelector(this)">
                        <div>?</div>
                    </div>
                    <div class="card" data-player="community" data-index="1" onclick="openSelector(this)">
                        <div>?</div>
                    </div>
                    <div class="card" data-player="community" data-index="2" onclick="openSelector(this)">
                        <div>?</div>
                    </div>
                    <div class="card" data-player="community" data-index="3" onclick="openSelector(this)">
                        <div>?</div>
                    </div>
                    <div class="card" data-player="community" data-index="4" onclick="openSelector(this)">
                        <div>?</div>
                    </div>
                </div>
            </div>
            
            <div class="controls">
                <label>Simulations:</label>
                <select id="simulations">
                    <option value="10000">10,000</option>
                    <option value="50000" selected>50,000</option>
                    <option value="100000">100,000</option>
                </select>
            </div>
            
            <div class="buttons">
                <button id="calcBtn" class="btn-green" onclick="calculate()">
                    Calculate Equity
                </button>
                <button class="btn-gray" onclick="clearAll()">
                    Clear All
                </button>
            </div>
            
            <div id="status"></div>
            <div id="results"></div>
        </div>
        
        <!-- Info Section -->
        <div class="info">
            <h2>About Pineapple Hold'em Poker</h2>
            
            <h4>🃏 How It Works</h4>
            <ul>
                <li><strong>3 Hole Cards:</strong> Each player receives 3 cards instead of 2</li>
                <li><strong>Discard Decision:</strong> Must discard 1 card before the flop</li>
                <li><strong>Regular Play:</strong> Continues like normal Texas Hold'em after discard</li>
                <li><strong>Best 5 Cards:</strong> Make the best hand from remaining 2 hole cards + 5 community cards</li>
            </ul>
            
            <h4>🎯 Strategy Differences</h4>
            <ul>
                <li><strong>More Drawing Hands:</strong> Suited connectors and drawing hands gain value</li>
                <li><strong>Pocket Pairs Stronger:</strong> Better odds of making sets</li>
                <li><strong>Position Crucial:</strong> Seeing opponents' discards provides information</li>
                <li><strong>Bigger Pots:</strong> More action due to stronger starting hands</li>
            </ul>
            
            <h4>🧮 About This Calculator</h4>
            <ul>
                <li><strong>Monte Carlo Method:</strong> Runs thousands of simulations for accuracy</li>
                <li><strong>All Combinations:</strong> Tests all possible 2-card selections from 3-card hands</li>
                <li><strong>Pre & Post-Flop:</strong> Calculate equity before and after community cards</li>
                <li><strong>Proven Algorithms:</strong> Based on standard poker evaluation methods</li>
            </ul>
        </div>
    </div>

    <!-- Card Selector Modal -->
    <div id="modal" class="modal">
        <div class="modal-content">
            <h3>Select Card</h3>
            <button onclick="closeSelector()" style="float: right; background: none; border: none; font-size: 20px;">×</button>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; text-align: center; font-size: 20px;">
                <div class="black">♠</div>
                <div class="red">♥</div>
                <div class="red">♦</div>
                <div class="black">♣</div>
            </div>
            
            <div class="card-grid" id="cardGrid"></div>
            
            <button onclick="removeCard()" style="width: 100%; background: #dc3545; color: white; padding: 10px; border: none; border-radius: 5px; margin-top: 15px; display: none;" id="removeBtn">
                Remove Card
            </button>
        </div>
    </div>

    <script>
        // Global variables
        let pyodide = null;
        let isReady = false;
        let currentCard = null;
        
        // Card definitions
        const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
        const suits = [
            { symbol: '♠', value: 's', color: 'black' },
            { symbol: '♥', value: 'h', color: 'red' },
            { symbol: '♦', value: 'd', color: 'red' },
            { symbol: '♣', value: 'c', color: 'black' }
        ];
        
        // Initialize Python environment
        async function initPython() {
            if (isReady) return;
            
            showStatus('Loading Python environment... (first time takes 15-20 seconds)', 'loading');
            
            try {
                pyodide = await loadPyodide();
                console.log('Pyodide loaded');
                
                await pyodide.loadPackage(['numpy']);
                console.log('NumPy loaded');
                
                showStatus('Loading your poker modules...', 'loading');
                
                // Load your Python files
                const files = ['Cardset.py', 'player.py', 'temp_player.py', 'evaluator.py', 'monte_carlo.py'];
                
                for (const file of files) {
                    try {
                        const response = await fetch(`python/${file}`);
                        if (response.ok) {
                            const code = await response.text();
                            pyodide.runPython(code);
                            console.log(`✅ Loaded ${file}`);
                        } else {
                            console.log(`⚠️ Could not fetch ${file}`);
                        }
                    } catch (error) {
                        console.log(`⚠️ Error loading ${file}:`, error.message);
                    }
                }
                
                // Add wrapper function
                pyodide.runPython(`
def web_calculate_equity(p1_cards, p2_cards, community_cards=[], sims=50000):
    """Wrapper function for web interface"""
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
                
                isReady = true;
                showStatus('✅ Ready! Click cards to select them.', 'success');
                
            } catch (error) {
                showStatus('❌ Failed to load Python: ' + error.message, 'error');
                console.error('Initialization error:', error);
            }
        }
        
        // Card selector functions
        function openSelector(cardElement) {
            currentCard = cardElement;
            generateCardGrid();
            
            const hasCard = cardElement.dataset.card;
            document.getElementById('removeBtn').style.display = hasCard ? 'block' : 'none';
            
            document.getElementById('modal').classList.add('show');
        }
        
        function closeSelector() {
            document.getElementById('modal').classList.remove('show');
            currentCard = null;
        }
        
        function generateCardGrid() {
            const grid = document.getElementById('cardGrid');
            grid.innerHTML = '';
            
            const usedCards = getUsedCards();
            
            ranks.forEach(rank => {
                suits.forEach(suit => {
                    const cardCode = rank + suit.value;
                    const isUsed = usedCards.includes(cardCode);
                    
                    const div = document.createElement('div');
                    div.className = `card-option ${suit.color}${isUsed ? ' disabled' : ''}`;
                    div.innerHTML = `<div><strong>${rank}</strong></div><div>${suit.symbol}</div>`;
                    
                    if (!isUsed) {
                        div.onclick = () => selectCard(cardCode);
                    }
                    
                    grid.appendChild(div);
                });
            });
        }
        
        function selectCard(cardCode) {
            if (currentCard) {
                const rank = cardCode[0];
                const suitCode = cardCode[1];
                const suit = suits.find(s => s.value === suitCode);
                
                currentCard.innerHTML = `
                    <div class="${suit.color}" style="font-weight: bold;">${rank}</div>
                    <div class="${suit.color}">${suit.symbol}</div>
                `;
                currentCard.classList.add('filled');
                currentCard.dataset.card = cardCode;
            }
            closeSelector();
        }
        
        function removeCard() {
            if (currentCard) {
                currentCard.innerHTML = '<div>?</div>';
                currentCard.classList.remove('filled');
                delete currentCard.dataset.card;
            }
            closeSelector();
        }
        
        function getUsedCards() {
            const cards = [];
            document.querySelectorAll('[data-card]').forEach(el => {
                if (el.dataset.card) {
                    cards.push(el.dataset.card);
                }
            });
            return cards;
        }
        
        function getPlayerCards(player) {
            const cards = [];
            document.querySelectorAll(`[data-player="${player}"]`).forEach(el => {
                if (el.dataset.card) {
                    cards.push(el.dataset.card);
                }
            });
            return cards;
        }
        
        // Main calculation
        async function calculate() {
            if (!isReady) await initPython();
            if (!isReady) return;
            
            const btn = document.getElementById('calcBtn');
            btn.textContent = 'Calculating...';
            btn.disabled = true;
            
            try {
                const p1Cards = getPlayerCards('1');
                const p2Cards = getPlayerCards('2');
                const communityCards = getPlayerCards('community');
                const sims = parseInt(document.getElementById('simulations').value);
                
                if (p1Cards.length !== 3 || p2Cards.length !== 3) {
                    throw new Error('Both players need exactly 3 cards');
                }
                
                showStatus(`Running ${sims.toLocaleString()} simulations...`, 'loading');
                
                // Call Python function
                pyodide.globals.set("p1_cards", p1Cards);
                pyodide.globals.set("p2_cards", p2Cards);
                pyodide.globals.set("community_cards", communityCards);
                pyodide.globals.set("num_sims", sims);
                
                const results = pyodide.runPython('web_calculate_equity(p1_cards, p2_cards, community_cards, num_sims)');
                
                if (results.error) {
                    throw new Error(results.error);
                }
                
                showResults(results, p1Cards, p2Cards);
                showStatus('✅ Calculation complete!', 'success');
                
            } catch (error) {
                showStatus('❌ Error: ' + error.message, 'error');
                console.error('Calculation error:', error);
            } finally {
                btn.textContent = 'Calculate Equity';
                btn.disabled = false;
            }
        }
        
        function showResults(results, p1Cards, p2Cards) {
            const p1Pct = (results.player1_equity * 100).toFixed(1);
            const p2Pct = (results.player2_equity * 100).toFixed(1);
            const tiePct = (results.ties * 100).toFixed(1);
            
            document.getElementById('results').innerHTML = `
                <div class="results">
                    <h3>📊 Equity Results</h3>
                    <div class="equity-row">
                        <div class="equity-item">
                            <h4>Player 1</h4>
                            <div class="equity-value p1-equity">${p1Pct}%</div>
                            <div style="font-size: 14px; color: #666;">${p1Cards.join(' ')}</div>
                        </div>
                        <div class="equity-item">
                            <h4>Player 2</h4>
                            <div class="equity-value p2-equity">${p2Pct}%</div>
                            <div style="font-size: 14px; color: #666;">${p2Cards.join(' ')}</div>
                        </div>
                        <div class="equity-item">
                            <h4>Ties</h4>
                            <div class="equity-value tie-equity">${tiePct}%</div>
                            <div style="font-size: 14px; color: #666;">Split pot</div>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
                        Based on ${results.simulations.toLocaleString()} Monte Carlo simulations
                    </div>
                </div>
            `;
        }
        
        function showStatus(message, type = '') {
            document.getElementById('status').innerHTML = `<div class="status ${type}">${message}</div>`;
        }
        
        function clearAll() {
            document.querySelectorAll('.card').forEach(card => {
                card.innerHTML = '<div>?</div>';
                card.classList.remove('filled');
                delete card.dataset.card;
            });
            document.getElementById('results').innerHTML = '';
            document.getElementById('status').innerHTML = '';
        }
        
        // Initialize when page loads
        window.addEventListener('load', () => {
            console.log('Page loaded, initializing Python...');
            setTimeout(initPython, 1000);
        });
        
        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('modal');
            if (event.target === modal) {
                closeSelector();
            }
        }
    </script>
</body>
</html>