# Pineapple Poker Equity Calculator

## Overview
This project is a **Pineapple Poker Equity Calculator** — a rare and specialized tool for evaluating hand equity in *Pineapple Poker*, a Texas Hold’em variant where each player is dealt three hole cards and must discard one after the flop.  
While there are **hundreds of equity calculators** for standard Texas Hold’em, this is the **only publicly available, browser-deployable Pineapple Poker equity calculator** that runs entirely client-side.

## Features
- **Full Pineapple Poker logic** implemented in Python  
- **Monte Carlo simulation engine** for accurate equity calculations  
- **Web-based UI** for instant, interactive analysis  
- **Debug console** for tracking calculation steps, performance, and errors  
- **Simulation count selection** for precision vs. speed trade-offs  
- **All-in-one client-side execution** using Pyodide (Python in the browser, no server required)

## Game Theory Significance
Equity calculation is essential in poker game theory for:
- **Optimal Decision Making** – Determine whether to bet, call, or fold based on expected value.  
- **Exploitative Play Analysis** – Identify opponent tendencies by comparing theoretical equity vs. observed behavior.  
- **Range Construction** – Evaluate equity across multiple possible hands.  
- **Pineapple-specific Strategy** – Understand the equity impact of discarding one card post-flop, a key strategic twist absent from Hold’em.

Pineapple Poker has been underexplored in poker theory literature compared to Hold’em — this calculator fills that gap.

## How It Works
1. **Python Logic**  
   - Core equity computation in `monte_carlo.py` and `evaluator.py`  
   - Card handling via `Cardset.py` and `player.py`
2. **Browser Execution**  
   - Python code runs via Pyodide, enabling direct execution in a web browser  
   - No backend server — 100% client-side
3. **Monte Carlo Simulations**  
   - Random dealouts of remaining cards  
   - Tracks wins, ties, and losses to compute equity percentages

## Project History
- Originally written in **senior year of college** as part of a **Game Theory in Poker** presentation  
- Updated and adapted for web deployment in 2025  
- Received assistance from **Claude** and **ChatGPT** in debugging deployment issues and optimizing the Pyodide integration

## Tech Stack
- **Python** – Core poker logic & simulations  
- **Pyodide** – Run Python directly in the browser  
- **HTML/CSS/JavaScript** – UI and integration  
- **NumPy** – Efficient numerical operations in Python

## Deployment
Hosted via **GitHub Pages**: [Live Demo](https://jonathonleiding.github.io/pineapple-poker-equity-calculator/)  

**Local Run Instructions:**
```bash
git clone https://github.com/JonathonLeiding/pineapple-poker-equity-calculator.git
cd pineapple-poker-equity-calculator
# Open index.html in your browser
```

## Acknowledgements
- Original Python poker logic: written during college (2023)  
- Web deployment & debugging assistance: Claude Sonnet, ChatGPT  
- Pyodide for enabling Python in browser  
- NumPy for performance improvements
