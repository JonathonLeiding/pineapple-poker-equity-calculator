let pyodide;
let isInitialized = false;
let isCalculating = false;

// ============================================================================
// DEBUG SYSTEM
// ============================================================================

let debugHistory = [];
let debugConsoleVisible = false;

function debugLog(message, isError = false) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
        time: timestamp,
        message: message,
        isError: isError,
        type: isError ? 'ERROR' : 'INFO'
    };
    
    debugHistory.push(logEntry);
    
    if (isError) {
        console.error(`[${timestamp}] ${message}`);
    } else {
        console.log(`[${timestamp}] ${message}`);
    }
    
    if (debugConsoleVisible) {
        updateDebugConsole();
    }
    
    const status = document.getElementById('status');
    const currentContent = status.innerHTML;
    const className = isError ? 'error' : 'debug';
    status.innerHTML = currentContent + `<div class="status ${className}">[${timestamp}] ${message}</div>`;
}

function toggleDebugConsole() {
    const console = document.getElementById('debugConsole');
    debugConsoleVisible = !debugConsoleVisible;
    
    if (debugConsoleVisible) {
        console.style.display = 'block';
        updateDebugConsole();
        document.querySelector('button[onclick="toggleDebugConsole()"]').textContent = 'Hide Debug Console';
    } else {
        console.style.display = 'none';
        document.querySelector('button[onclick="toggleDebugConsole()"]').textContent = 'Show Debug Console';
    }
}

function updateDebugConsole() {
    const output = document.getElementById('debugOutput');
    if (!output) return;
    
    let html = '';
    debugHistory.forEach(entry => {
        const color = entry.isError ? '#dc3545' : '#495057';
        const icon = entry.isError ? '❌' : '📝';
        html += `<div style="margin-bottom: 8px; color: ${color};">
            <span style="color: #6c757d;">[${entry.time}]</span> 
            ${icon} <strong>${entry.type}:</strong> ${entry.message}
        </div>`;
    });
    
    if (html === '') {
        html = '<div style="color: #6c757d;">No debug messages yet...</div>';
    }
    
    output.innerHTML = html;
    output.scrollTop = output.scrollHeight;
}

function clearDebugLog() {
    debugHistory = [];
    updateDebugConsole();
    document.getElementById('status').innerHTML = '';
}

function copyDebugLog() {
    const logText = debugHistory.map(entry => 
        `[${entry.time}] ${entry.type}: ${entry.message}`
    ).join('\n');
    
    navigator.clipboard.writeText(logText).then(() => {
        alert('Debug log copied to clipboard!');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = logText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Debug log copied to clipboard!');
    });
}

// ============================================================================
// PYTHON INITIALIZATION - LOADING FROM FILES
// ============================================================================

async function initializePyodide() {
    if (isInitialized) return;
    
    showStatus('Loading Python environment... (this takes 10-20 seconds first time)', 'loading');
    debugLog('🚀 Starting Python initialization process');
    
    try {
        debugLog(⬇️ Loading Pyodide from CDN...');
        pyodide = await loadPyodide();
        debugLog('✅ Pyodide loaded successfully');
        
        debugLog('⬇️ Loading NumPy package...');
        await pyodide.loadPackage(["numpy"]);
        debugLog('✅ NumPy loaded successfully');
        
        // Load your Python files from root directory
        const pythonFiles = [
            'Cardset.py',
            'player.py', 
            'temp_player.py',
            'evaluator.py',
            'monte_carlo.py'
        ];
        
        debugLog('📦 Starting module loading sequence...');
        
        for (const file of pythonFiles) {
            try {
                debugLog(`📝 Loading ${file}...`);
                const response = await fetch(file);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${file}: ${response.status} ${response.statusText}`);
                }
                
                const code = await response.text();
                pyodide.runPython(code);
                debugLog(`✅ ${file} loaded successfully`);
                
            } catch (error) {
                debugLog(`❌ Could not load ${file}: ${error.message}`, true);
                throw error; // Stop if any file fails to load
            }
        }
        
        // Test that everything works
        debugLog('🧪 Testing basic functionality...');
        const testResult = pyodide.runPython(`
try:
    # Test each component
    deck = Cardset()
    player1 = Player()
    player2 = Player()
    
    # Test setting cards
    player1.set_cards(['As', 'Ks', 'Qs'], deck)
    player2.set_cards(['2s', '3s', '4s'], deck)
    
    # Quick equity test
    results = estimate_equity(player1, player2, deck, 100)
    
    f"SUCCESS: P1={results[0]:.3f}, P2={results[1]:.3f}, Ties={results[2]:.3f}"
    
except Exception as e:
    import traceback
    f"ERROR: {str(e)} | Traceback: {traceback.format_exc()}"
        `);
        
        debugLog(`🧪 Test result: ${testResult}`);
        
        if (!testResult || !testResult.startsWith("SUCCESS")) {
            throw new Error(`Initialization test failed: ${testResult}`);
        }
        
        isInitialized = true;
        debugLog('🎉 Python environment fully initialized');
        showStatus('✅ Ready! Click cards to select them.', 'success');
        
    } catch (error) {
        debugLog(`💥 INITIALIZATION FAILED: ${error.message}`, true);
        showStatus('❌ Failed to load Python environment: ' + error.message, 'error');
        isInitialized = false;
        pyodide = null;
    }
}

// ============================================================================
// CALCULATION LOGIC
// ============================================================================

async function calculateEquity() {
    if (isCalculating) return;
    if (!isInitialized) await initializePyodide();
    
    if (!isInitialized) {
        showStatus('❌ Python environment not ready', 'error');
        return;
    }
    
    isCalculating = true;
    const btn = document.getElementById('calcBtn');
    btn.textContent = 'Calculating...';
    btn.disabled = true;
    
    try {
        const p1Cards = getPlayerCards('1');
        const p2Cards = getPlayerCards('2');
        const communityCards = getPlayerCards('community');
        const sims = parseInt(document.getElementById('simulations').value);
        
        if (p1Cards.length !== 3) {
            throw new Error(`Player 1 needs exactly 3 cards (has ${p1Cards.length})`);
        }
        if (p2Cards.length !== 3) {
            throw new Error(`Player 2 needs exactly 3 cards (has ${p2Cards.length})`);
        }
        
        debugLog(`🔄 Starting calculation with ${sims} simulations...`);
        showStatus(`🔄 Running ${sims.toLocaleString()} simulations...`, 'loading');
        
        // Set up the calculation
        pyodide.globals.set("p1_cards", p1Cards);
        pyodide.globals.set("p2_cards", p2Cards);
        pyodide.globals.set("community_cards", communityCards);
        pyodide.globals.set("num_sims", sims);
        
        const calculationCode = `
# Your exact Python logic from monte_carlo.py!
deck = Cardset()
hero = Player()
villain = Player()

hero.set_cards(p1_cards, deck)
villain.set_cards(p2_cards, deck)

if len(community_cards) > 0:
    deck.set_community_cards(community_cards)
    equity_results = estimate_equity(hero, villain, deck, num_sims, num_cards=len(community_cards), set_board=community_cards)
else:
    equity_results = estimate_equity(hero, villain, deck, num_sims)

# Return as simple list for easy conversion
[float(equity_results[0]), float(equity_results[1]), float(equity_results[2])]
        `;
        
        debugLog('🐍 Executing equity calculation...');
        const pythonResults = pyodide.runPython(calculationCode);
        debugLog(`📊 Python returned: ${pythonResults}`);
        
        // Convert to JavaScript
        let jsResults;
        if (pythonResults && pythonResults.toJs) {
            jsResults = pythonResults.toJs();
        } else if (Array.isArray(pythonResults)) {
            jsResults = pythonResults;
        } else {
            // Manual extraction
            jsResults = [
                parseFloat(pythonResults[0]) || 0,
                parseFloat(pythonResults[1]) || 0,
                parseFloat(pythonResults[2]) || 0
            ];
        }
        
        debugLog(`📊 Converted results: [${jsResults[0]}, ${jsResults[1]}, ${jsResults[2]}]`);
        
        // Validate results
        if (!Array.isArray(jsResults) || jsResults.length !== 3) {
            throw new Error(`Invalid results format: ${JSON.stringify(jsResults)}`);
        }
        
        const [p1Equity, p2Equity, tieEquity] = jsResults;
        if (p1Equity === 0 && p2Equity === 0 && tieEquity === 0) {
            throw new Error('All equity values are 0 - calculation failed');
        }
        
        // Display results
        const results = {
            player1_equity: p1Equity,
            player2_equity: p2Equity,
            ties: tieEquity,
            simulations: sims,
            player1_cards: p1Cards,
            player2_cards: p2Cards,
            community_cards: communityCards
        };
        
        displayResults(results);
        showStatus('✅ Calculation complete!', 'success');
        debugLog('✅ Calculation successful!');
        
    } catch (error) {
        debugLog(`❌ Calculation error: ${error.message}`, true);
        showStatus('❌ Error: ' + error.message, 'error');
    } finally {
        isCalculating = false;
        btn.textContent = 'Calculate Equity';
        btn.disabled = false;
    }
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testPython() {
    if (!pyodide) {
        showStatus('⚠️ Python not loaded yet', 'error');
        return;
    }
    
    try {
        debugLog('🧪 Testing Python functionality...');
        
        const basicTest = pyodide.runPython('2 + 3');
        debugLog(`Basic test: 2 + 3 = ${basicTest}`);
        
        const equityTest = pyodide.runPython(`
try:
    deck = Cardset()
    hero = Player()
    villain = Player()
    hero.set_cards(['As', 'Ah', 'Th'], deck)
    villain.set_cards(['3s', '6h', 'Kc'], deck)
    results = estimate_equity(hero, villain, deck, 100)
    f"Equity test passed: P1={results[0]:.3f}, P2={results[1]:.3f}, Ties={results[2]:.3f}"
except Exception as e:
    f"Equity test failed: {str(e)}"
        `);
        debugLog(`Equity test: ${equityTest}`);
        
        showStatus('✅ Python tests completed successfully!', 'success');
        
    } catch (error) {
        debugLog(`❌ Python test failed: ${error.message}`, true);
        showStatus('❌ Python test failed: ' + error.message, 'error');
    }
}

// ============================================================================
// UI FUNCTIONS
// ============================================================================

let currentCard = null;

const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const suits = [
    { symbol: '♠', value: 's', color: 'black' },
    { symbol: '♥', value: 'h', color: 'red' },
    { symbol: '♦', value: 'd', color: 'red' },
    { symbol: '♣', value: 'c', color: 'black' }
];

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

function displayResults(results) {
    const p1Pct = (results.player1_equity * 100).toFixed(1);
    const p2Pct = (results.player2_equity * 100).toFixed(1);
    const tiePct = (results.ties * 100).toFixed(1);
    
    const communityText = results.community_cards && results.community_cards.length > 0 ? 
        `<div style="text-align: center; margin: 15px 0; color: #666;">
            Community: ${results.community_cards.join(' ')}
        </div>` : '';
    
    document.getElementById('results').innerHTML = `
        <div class="results">
            <h3>📊 Equity Results</h3>
            ${communityText}
            <div class="equity-row">
                <div class="equity-item">
                    <h4>Player 1</h4>
                    <div class="equity-value p1-equity">${p1Pct}%</div>
                    <div style="font-size: 14px; color: #666;">${results.player1_cards.join(' ')}</div>
                </div>
                <div class="equity-item">
                    <h4>Player 2</h4>
                    <div class="equity-value p2-equity">${p2Pct}%</div>
                    <div style="font-size: 14px; color: #666;">${results.player2_cards.join(' ')}</div>
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

function showStatus(message, className = '') {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = `<div class="status ${className}">${message}</div>`;
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

// ============================================================================
// INITIALIZATION
// ============================================================================

// Auto-initialize when page loads
window.addEventListener('load', () => {
    debugLog('Page loaded, starting initialization...');
    initializePyodide();
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeSelector();
    }
}

// Expose functions to global scope for HTML onclick handlers
window.calculate = calculateEquity;
window.testPython = testPython;
window.clearAll = clearAll;
window.openSelector = openSelector;
window.closeSelector = closeSelector;
window.selectCard = selectCard;
window.removeCard = removeCard;
window.toggleDebugConsole = toggleDebugConsole;
window.clearDebugLog = clearDebugLog;
window.copyDebugLog = copyDebugLog;