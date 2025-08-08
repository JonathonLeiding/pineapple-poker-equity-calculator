let pyodide;
let isInitialized = false;
let isCalculating = false;

async function initializePyodide() {
    if (isInitialized) return;
    
    showStatus('Loading Python environment... (this takes 10-20 seconds first time)', 'loading-status');
    
    try {
        pyodide = await loadPyodide();
        await pyodide.loadPackage(["numpy"]);
        
        // Load your Python files
        const pythonFiles = [
            'python/Cardset.py',
            'python/player.py', 
            'python/temp_player.py',
            'python/evaluator.py',
            'python/monte_carlo.py'
        ];
        
        for (const file of pythonFiles) {
            try {
                const response = await fetch(file);
                const code = await response.text();
                pyodide.runPython(code);
            } catch (error) {
                console.warn(`Could not load ${file}:`, error);
            }
        }
        
        isInitialized = true;
        showStatus('✅ Python environment loaded! Ready to calculate.', 'success');
        
    } catch (error) {
        showStatus('❌ Failed to load Python environment: ' + error.message, 'error');
    }
}

async function calculateEquity() {
    if (isCalculating) return;
    if (!isInitialized) await initializePyodide();
    
    isCalculating = true;
    const btn = document.getElementById('calculateBtn');
    btn.textContent = 'Calculating...';
    btn.className = 'calculate-btn loading';
    
    try {
        // Get inputs
        const p1Cards = [
            document.getElementById('p1c1').value.trim(),
            document.getElementById('p1c2').value.trim(), 
            document.getElementById('p1c3').value.trim()
        ].filter(card => card.length === 2);
        
        const p2Cards = [
            document.getElementById('p2c1').value.trim(),
            document.getElementById('p2c2').value.trim(),
            document.getElementById('p2c3').value.trim() 
        ].filter(card => card.length === 2);
        
        const communityCards = [
            document.getElementById('cc1').value.trim(),
            document.getElementById('cc2').value.trim(),
            document.getElementById('cc3').value.trim(),
            document.getElementById('cc4').value.trim(),
            document.getElementById('cc5').value.trim()
        ].filter(card => card.length === 2);
        
        const simulations = parseInt(document.getElementById('simulations').value);
        
        // Validation
        if (p1Cards.length !== 3 || p2Cards.length !== 3) {
            throw new Error('Both players need exactly 3 cards');
        }
        
        showStatus(`Running ${simulations.toLocaleString()} simulations...`, 'loading-status');
        
        // Call your Python code!
        pyodide.globals.set("p1_cards", p1Cards);
        pyodide.globals.set("p2_cards", p2Cards);
        pyodide.globals.set("community_cards", communityCards);
        pyodide.globals.set("num_sims", simulations);
        
        const results = pyodide.runPython(`
# Your exact Python logic!
import monte_carlo as mc

deck = mc.Cardset()
hero = mc.Player()
villain = mc.Player()

hero.set_cards(p1_cards, deck)
villain.set_cards(p2_cards, deck)

if len(community_cards) > 0:
    deck.set_community_cards(community_cards)

# Use your existing estimate_equity function
equity_results = mc.estimate_equity(hero, villain, deck, num_sims)

# Return results as Python dict
{
    'player1_equity': equity_results[0],
    'player2_equity': equity_results[1], 
    'ties': equity_results[2],
    'simulations': num_sims
}
        `);
        
        // Display results
        displayResults(results);
        showStatus('✅ Calculation complete!', 'success');
        
    } catch (error) {
        showStatus('❌ Error: ' + error.message, 'error');
    } finally {
        isCalculating = false;
        btn.textContent = 'Calculate Equity';
        btn.className = 'calculate-btn';
    }
}

function displayResults(results) {
    const p1Pct = (results.player1_equity * 100).toFixed(1);
    const p2Pct = (results.player2_equity * 100).toFixed(1);
    const tiePct = (results.ties * 100).toFixed(1);
    
    document.getElementById('results').innerHTML = `
        <h3>Equity Results</h3>
        <div style="display: flex; justify-content: space-around; margin: 20px 0;">
            <div style="text-align: center;">
                <h4>Player 1</h4>
                <div style="font-size: 24px; color: #28a745; font-weight: bold;">${p1Pct}%</div>
            </div>
            <div style="text-align: center;">
                <h4>Player 2</h4>
                <div style="font-size: 24px; color: #dc3545; font-weight: bold;">${p2Pct}%</div>
            </div>
            <div style="text-align: center;">
                <h4>Ties</h4>
                <div style="font-size: 18px; color: #6c757d;">${tiePct}%</div>
            </div>
        </div>
        <div style="text-align: center; color: #666; font-size: 14px;">
            Based on ${results.simulations.toLocaleString()} simulations
        </div>
    `;
}

function showStatus(message, className = '') {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = `<div class="status ${className}">${message}</div>`;
}

function clearAll() {
    document.querySelectorAll('.card-input').forEach(input => input.value = '');
    document.getElementById('results').innerHTML = '';
    document.getElementById('status').innerHTML = '';
}

// Auto-initialize when page loads
window.addEventListener('load', initializePyodide);