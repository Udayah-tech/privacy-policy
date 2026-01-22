
document.addEventListener('DOMContentLoaded', () => {
    /* =========================================
       DOM ELEMENTS
       ========================================= */
    const inputField = document.getElementById('smart-input');
    const inputLabel = document.getElementById('input-label');
    const unitChipsContainer = document.querySelector('.unit-chips');
    const resultsContainer = document.getElementById('results-container');
    const catChips = document.querySelectorAll('.cat-chip');

    /* =========================================
       DATA & CONFIGURATION
       ========================================= */

    // Structure: Category -> Base Unit -> Units Map
    // Factors are relative to the Base Unit of that category.
    const CONVERSION_DATA = {
        'Length': {
            base: 'mm',
            icon: '📏',
            units: {
                // Metric
                mm: { factor: 1, label: 'Millimeters', icon: '🎯' },
                cm: { factor: 10, label: 'Centimeters', icon: '📏' },
                m: { factor: 1000, label: 'Meters', icon: '🏗️' },
                km: { factor: 1000000, label: 'Kilometers', icon: '🛣️' },
                um: { factor: 0.001, label: 'Micrometers', icon: '🔬' },
                nm: { factor: 0.000001, label: 'Nanometers', icon: '🧬' },
                // Imperial
                inch: { factor: 25.4, label: 'Inches', icon: '📏', aliases: ['in', '"'] },
                feet: { factor: 304.8, label: 'Feet', icon: '🦶', aliases: ['ft', "'"] },
                yard: { factor: 914.4, label: 'Yards', icon: '⛳', aliases: ['yd'] },
                mile: { factor: 1609344, label: 'Miles', icon: '🚗', aliases: ['mi'] },
                soot: { factor: 3.175, label: 'Soot', icon: '🐜', aliases: ['s'] }
            }
        },
        'Mass': {
            base: 'g',
            icon: '⚖️',
            units: {
                mg: { factor: 0.001, label: 'Milligrams', icon: '💊' },
                g: { factor: 1, label: 'Grams', icon: '⚖️' },
                kg: { factor: 1000, label: 'Kilograms', icon: '🏋️' },
                t: { factor: 1000000, label: 'Metric Ton', icon: '🚛' },
                oz: { factor: 28.3495, label: 'Ounces', icon: '🥤' },
                lb: { factor: 453.592, label: 'Pounds', icon: '🍔' },
                stone: { factor: 6350.29, label: 'Stone', icon: '🪨' },
                tola: { factor: 11.6638, label: 'Tola', icon: '⚖️' }
            }
        },
        'Area': {
            base: 'sqm',
            icon: '⬜',
            units: {
                sqmm: { factor: 0.000001, label: 'Sq Millimeters', icon: '🤏' },
                sqcm: { factor: 0.0001, label: 'Sq Centimeters', icon: '🟦' },
                sqm: { factor: 1, label: 'Sq Meters', icon: '🏠' },
                ha: { factor: 10000, label: 'Hectares', icon: '🌳' },
                sqkm: { factor: 1000000, label: 'Sq Kilometers', icon: '🗺️' },
                sqin: { factor: 0.00064516, label: 'Sq Inches', icon: '🔳' },
                sqft: { factor: 0.092903, label: 'Sq Feet', icon: '🦶' },
                ac: { factor: 4046.86, label: 'Acres', icon: '🏞️' },
                sqmi: { factor: 2589988, label: 'Sq Miles', icon: '🌍' }
            }
        },
        'Volume': {
            base: 'l',
            icon: '🧊',
            units: {
                ml: { factor: 0.001, label: 'Milliliters', icon: '🧪' },
                l: { factor: 1, label: 'Liters', icon: '🥛' },
                cm3: { factor: 0.001, label: 'Cubic CM', icon: '🧊' },
                m3: { factor: 1000, label: 'Cubic Meters', icon: '📦' },
                floz: { factor: 0.0295735, label: 'Fluid Oz (US)', icon: '🥤' },
                gal: { factor: 3.78541, label: 'Gallons (US)', icon: '⛽' },
                pt: { factor: 0.473176, label: 'Pints (US)', icon: '🍺' }
            }
        },
        'Speed': {
            base: 'mps',
            icon: '🚀',
            units: {
                mps: { factor: 1, label: 'Metre/Sec', icon: '🏃' },
                kmh: { factor: 0.277778, label: 'Km/Hour', icon: '🚗' },
                mph: { factor: 0.44704, label: 'Miles/Hour', icon: '🏎️' },
                kn: { factor: 0.514444, label: 'Knots', icon: '⛵' },
                ftps: { factor: 0.3048, label: 'Feet/Sec', icon: '👟' }
            }
        },
        'Pressure': {
            base: 'pa',
            icon: '🔩',
            units: {
                pa: { factor: 1, label: 'Pascals', icon: '🎈' },
                kpa: { factor: 1000, label: 'Kilopascals', icon: '💨' },
                bar: { factor: 100000, label: 'Bar', icon: '📊' },
                psi: { factor: 6894.76, label: 'PSI', icon: '⚙️' },
                atm: { factor: 101325, label: 'Atmosphere', icon: '🌍' }
            }
        },
        'Force': {
            base: 'n',
            icon: '💪',
            units: {
                n: { factor: 1, label: 'Newtons', icon: '🍏' },
                kn: { factor: 1000, label: 'Kilonewtons', icon: '🏗️' },
                lbf: { factor: 4.44822, label: 'Pound-force', icon: '⚖️' },
                kgf: { factor: 9.80665, label: 'Kilogram-force', icon: '🏋️' }
            }
        },
        'Temperature': {
            base: 'c',
            icon: '🌡️',
            units: {
                c: { label: 'Celsius', icon: '❄️' },
                f: { label: 'Fahrenheit', icon: '🔥' },
                k: { label: 'Kelvin', icon: '🧪' }
            },
            isSpecial: true // Flags that we need custom conversion functions
        }
    };

    let currentCategory = 'Length';

    /* =========================================
       CORE FUNCTIONS
       ========================================= */

    function switchCategory(category) {
        currentCategory = category;
        const config = CONVERSION_DATA[category];

        // Update Label
        inputLabel.textContent = `${config.icon} Enter ${category}`;
        inputField.placeholder = getPlaceholder(category);

        // Update Chips
        renderUnitChips(config.units);

        // Update Results Display (Build correct cards)
        setupResultCards(config.units);

        // Recalculate if there's input
        triggerCalculation();
    }

    function getPlaceholder(category) {
        switch (category) {
            case 'Length': return 'e.g. 5inch 3mm';
            case 'Mass': return 'e.g. 5kg 500g';
            case 'Temperature': return 'e.g. 30c';
            default: return `e.g. 10${Object.keys(CONVERSION_DATA[category].units)[0]}`;
        }
    }

    function renderUnitChips(unitsConfig) {
        unitChipsContainer.innerHTML = '';
        Object.keys(unitsConfig).forEach(unitKey => {
            const btn = document.createElement('button');
            btn.className = 'unit-chip';
            btn.dataset.unit = unitKey;
            btn.textContent = unitKey;

            btn.addEventListener('click', () => {
                const currentValue = inputField.value;
                inputField.value = currentValue + (currentValue.endsWith(' ') || currentValue === '' ? '' : ' ') + unitKey + ' ';
                inputField.focus();
                triggerCalculation();
            });

            unitChipsContainer.appendChild(btn);
        });
    }

    function setupResultCards(unitsConfig) {
        resultsContainer.innerHTML = '';
        let index = 0;

        Object.entries(unitsConfig).forEach(([key, info]) => {
            const isPrimary = index === 0; // First unit is primary highlight
            const delay = index * 0.05;

            const card = document.createElement('div');
            card.className = isPrimary ? 'result-item primary' : 'result-item';
            if (!isPrimary) card.style.setProperty('--delay', `${delay}s`);

            // Random-ish colors for non-primary cards based on index
            if (!isPrimary) {
                // We'll reuse the cyclic colors from CSS via child index
                // but let's just let CSS nth-child handle it for simplicity
            }

            // HTML Structure
            card.innerHTML = `
                <span class="label">${info.icon} ${info.label}</span>
                <div class="val-group">
                    <span class="value" id="res-${key}">0</span>
                    <span class="unit">${key}</span>
                </div>
            `;
            resultsContainer.appendChild(card);
            index++;
        });

        // Wrap non-primary cards in grid if needed? 
        // Existing CSS expects a flex container .results-container containing items.
        // It has a .result-grid child. Let's recreate structure to match CSS.

        // Wait, previous structure was: .primary item THEN .result-grid.
        // Let's stick to that for layout consistency.

        const cards = Array.from(resultsContainer.children);
        if (cards.length > 1) {
            const primary = cards[0];
            const others = cards.slice(1);

            resultsContainer.innerHTML = ''; // clear
            resultsContainer.appendChild(primary);

            const grid = document.createElement('div');
            grid.className = 'result-grid';
            others.forEach(c => grid.appendChild(c));
            resultsContainer.appendChild(grid);
        }
    }

    /* =========================================
       CALCULATION ENGINE
       ========================================= */

    function parseToCurrentBase(text) {
        if (!text) return 0;
        text = text.toLowerCase().replace(/,/g, '');

        // Special handling for Temperature (Single value only usually)
        if (CONVERSION_DATA[currentCategory].isSpecial) {
            // Basic parser for single temp unit. "100f", "30c"
            const regex = /([-\d.]+)\s*([a-z]+)/;
            const match = text.match(regex);
            if (match) {
                const val = parseFloat(match[1]);
                const unit = match[2];
                // Convert to Base C
                if (unit === 'f') return (val - 32) * 5 / 9;
                if (unit === 'k') return val - 273.15;
                return val; // assume C
            }
            // If just number, assume C
            const val = parseFloat(text);
            return isNaN(val) ? 0 : val;
        }

        /* --- STANDARD ACCUMULATOR --- */
        const unitsConfig = CONVERSION_DATA[currentCategory].units;
        // Build valid units string for regex
        const allKeys = Object.keys(unitsConfig);
        // Create map of alias -> canonical key
        const unitMap = {};
        allKeys.forEach(k => {
            unitMap[k] = k;
            if (unitsConfig[k].aliases) {
                unitsConfig[k].aliases.forEach(a => unitMap[a] = k);
            }
        });

        const validUnits = Object.keys(unitMap).sort((a, b) => b.length - a.length).join('|'); // sort by length to match "inch" before "in"
        const regex = new RegExp(`([\\d.]+)\\s*(${validUnits})`, 'g');

        let totalBase = 0;
        let match;
        let hasMatch = false;

        while ((match = regex.exec(text)) !== null) {
            hasMatch = true;
            const val = parseFloat(match[1]);
            const unitStr = match[2];
            const canonical = unitMap[unitStr];

            if (!isNaN(val) && canonical) {
                totalBase += val * unitsConfig[canonical].factor;
            }
        }

        if (!hasMatch) {
            const solo = parseFloat(text);
            if (!isNaN(solo)) {
                // Default to the first unit's factor (Base usually)
                // Or actually Base Factor is always 1 for the base unit key.
                // We defined base unit key in 'base' property.
                const baseKey = CONVERSION_DATA[currentCategory].base;
                // But wait, if input is just "5", do we assume MM or G etc?
                // Yes, assume factor 1 (Base Unit).
                // Actually, checking CONVERSION_DATA[cat].base gives us the key.
                return solo;
            }
        }

        return totalBase;
    }

    function triggerCalculation() {
        const text = inputField.value;
        const totalInBase = parseToCurrentBase(text);

        updateResultsAll(totalInBase);
    }

    function updateResultsAll(baseValue) {
        const unitsConfig = CONVERSION_DATA[currentCategory].units;
        const isTemp = CONVERSION_DATA[currentCategory].isSpecial;

        Object.keys(unitsConfig).forEach(key => {
            const el = document.getElementById(`res-${key}`);
            if (el) {
                let displayVal;

                if (isTemp) {
                    // Convert Base C -> Target
                    if (key === 'c') displayVal = baseValue;
                    else if (key === 'f') displayVal = (baseValue * 9 / 5) + 32;
                    else if (key === 'k') displayVal = baseValue + 273.15;
                } else {
                    // Standard Factor
                    // Value = Base / Factor   (e.g. 1000mm / 25.4 = ~39 inch)
                    displayVal = baseValue / unitsConfig[key].factor;
                }

                el.textContent = formatNumber(displayVal);
            }
        });
    }

    function formatNumber(num) {
        if (Math.abs(num) < 0.0001 && num !== 0) return num.toExponential(4);
        return parseFloat(num.toFixed(4));
    }

    /* =========================================
       EVENT LISTENERS
       ========================================= */

    // Category Chips
    catChips.forEach(chip => {
        chip.addEventListener('click', () => {
            catChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            switchCategory(chip.dataset.cat);
        });
    });

    // Input
    inputField.addEventListener('input', triggerCalculation);

    /* --- INITIALIZATION --- */
    switchCategory('Length');


    /* =========================================
       TAB & CALCULATOR LOGIC (PRESERVED)
       ========================================= */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });

    // --- CALCULATOR CODE ---
    // --- CALCULATOR CODE (BODMAS ENGINE) ---
    const calcHistory = document.getElementById('calc-history');
    const calcCurrent = document.getElementById('calc-current');
    const calcGrid = document.getElementById('calc-grid');
    const sciToggle = document.getElementById('sci-toggle');

    // State
    // We store the "raw" expression string for evaluation: e.g. "Math.sin(30 * Math.PI / 180) + 5"
    // And the "display" string for the user: e.g. "sin(30) + 5"
    let displayStr = ''; // What the user sees
    let isResultDisplayed = false; // To clear on new input if true

    function updateCalcDisplay() {
        calcCurrent.textContent = displayStr || '0';
        // Auto-scroll to end
        calcCurrent.scrollLeft = calcCurrent.scrollWidth;
    }

    function addToDisplay(val, type = 'num') {
        if (isResultDisplayed && type === 'num') {
            displayStr = '';
            calcHistory.textContent = `Ans = ${calcCurrent.textContent}`;
            isResultDisplayed = false;
        } else if (isResultDisplayed && type === 'op') {
            // Continuation logic: Use previous result
            isResultDisplayed = false;
            calcHistory.textContent = `Ans = ${calcCurrent.textContent}`;
            // displayStr remains (which is the result), operator appended below
        }

        // Prevent multiple operators in a row (basic check)
        const lastChar = displayStr.slice(-1);
        const ops = ['+', '-', '×', '÷', '^', '%'];

        if (ops.includes(lastChar) && ops.includes(val)) {
            // Replace last operator
            displayStr = displayStr.slice(0, -1) + val;
        } else {
            displayStr += val;
        }

        updateCalcDisplay();
    }

    // Toggle Scientific Mode
    let isScientific = false;
    sciToggle.addEventListener('click', () => {
        isScientific = !isScientific;
        if (isScientific) {
            calcGrid.classList.remove('simple-mode');
            calcGrid.classList.add('scientific-mode');
            sciToggle.textContent = '📱 Simple';
            sciToggle.style.color = '#60a5fa';
        } else {
            calcGrid.classList.add('simple-mode');
            calcGrid.classList.remove('scientific-mode');
            sciToggle.textContent = '🔬 Scientific';
            sciToggle.style.color = 'rgba(255, 255, 255, 0.7)';
        }
    });

    // Core buttons
    document.querySelectorAll('.calc-grid button').forEach(btn => {
        btn.addEventListener('click', () => {
            // Handle Toggle Button separately (though it's outside grid in grid logic, let's be safe)
            if (btn.id === 'sci-toggle') return;

            const action = btn.dataset.action;
            const val = btn.dataset.val;

            if (!action) {
                // Number or dot
                addToDisplay(val, 'num');
            } else if (action === 'operator') {
                // Standard Operators
                let op = val;
                if (val === '*') op = '×';
                if (val === '/') op = '÷';
                addToDisplay(op, 'op');
            } else if (action === 'sci') {
                // Scientific Functions
                handleScientificInput(val);
            } else if (action === 'calculate') {
                calculateResult();
            } else if (action === 'clear') {
                displayStr = '';
                calcHistory.textContent = '';
                isResultDisplayed = false;
                updateCalcDisplay();
            } else if (action === 'delete') {
                if (isResultDisplayed) {
                    displayStr = '';
                    isResultDisplayed = false;
                } else {
                    displayStr = displayStr.toString().slice(0, -1);
                }
                updateCalcDisplay();
            }
        });
    });

    function handleScientificInput(val) {
        if (isResultDisplayed) {
            // If result is shown, wrap it or start new? 
            // Logic: sin(Ans)
            isResultDisplayed = false;
        }

        switch (val) {
            case 'sin':
            case 'cos':
            case 'tan':
            case 'log':
            case 'ln':
            case 'sqrt':
                displayStr += `${val}(`;
                break;
            case 'pi':
                displayStr += 'π';
                break;
            case 'e':
                displayStr += 'e';
                break;
            case 'inv': // 1/x
                displayStr += '^( -1 )';
                break;
            case '^':
                displayStr += '^';
                break;
            case '(':
            case ')':
                displayStr += val;
                break;
        }
        updateCalcDisplay();
    }

    function calculateResult() {
        if (!displayStr) return;

        let evalStr = displayStr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/\^/g, '**')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(');

        // Trig Logic: Convert Degrees to Radians for JS Math functions
        // Regex to find sin(number), cos(number), tan(number)
        // Note: This simple regex handles basic cases. Nested trig might need a parser, 
        // but for a "Fun Calculator" this usually suffices or we assume degrees.
        // Actually, replacing `sin(` with `Math.sin((Math.PI/180)*` works if we balance parens,
        // but that's hard with regex. 
        // ALTERNATIVE: Use a custom function `sin(x)` that does the conversion.

        evalStr = evalStr
            .replace(/sin\(/g, 'dSin(')
            .replace(/cos\(/g, 'dCos(')
            .replace(/tan\(/g, 'dTan(');

        try {
            // Safe(ish) calculation
            const res = eval(evalStr); // Usage of eval for calculator logic

            calcHistory.textContent = displayStr + ' =';
            // Format result
            let final = parseFloat(res.toFixed(8)); // avoid float errors
            displayStr = final.toString();
            isResultDisplayed = true;
            updateCalcDisplay();
        } catch (e) {
            displayStr = 'Error';
            isResultDisplayed = true;
            updateCalcDisplay();
        }
    }

    // Degree Trig Helpers (Global scope for eval access)
    window.dSin = (d) => Math.sin(d * Math.PI / 180);
    window.dCos = (d) => Math.cos(d * Math.PI / 180);
    window.dTan = (d) => Math.tan(d * Math.PI / 180);


    /* =========================================
       AGE-SEGMENTED GAMES LOGIC
       ========================================= */

    /* --- DOM Elements --- */
    const ageSelector = document.getElementById('age-selector');
    const toddlerZone = document.getElementById('game-toddler');
    const studentZone = document.getElementById('game-student');
    const toddlerScoreEl = document.getElementById('toddler-score');
    const studentLevelEl = document.getElementById('student-level');
    const studentProgressEl = document.getElementById('student-progress');

    /* --- State --- */
    let currentAgeMode = null;
    let toddlerScore = 0;
    let studentScore = 0;
    let studentLevel = 1;
    let currentQuestion = null; // { q: "2 + 2", a: 4 }
    let timerInterval = null;
    let timeLeft = 10;

    /* --- Navigation --- */
    window.selectAgeMode = (mode) => {
        currentAgeMode = mode;
        ageSelector.classList.remove('active');

        if (mode === 'toddler') {
            toddlerZone.classList.add('active');
            initToddlerGame();
        } else {
            studentZone.classList.add('active');
            // Show menu first
            document.getElementById('student-menu').classList.remove('hidden');
            document.getElementById('student-numpad').classList.add('hidden');
            document.getElementById('student-question').textContent = "Pick a Mode!";
            document.getElementById('student-answer').textContent = "";
        }
    };

    window.showAgeSelector = () => {
        ageSelector.classList.add('active');
        toddlerZone.classList.remove('active');
        studentZone.classList.remove('active');
        currentAgeMode = null;
        stopTimer();
    };

    /* --- TODDLER GAME (Count the Emojis) --- */
    const EMOJIS = ['🍎', '🚗', '🐶', '🍕', '🎈', '⭐', '🍪', '🐱'];

    function initToddlerGame() {
        toddlerScore = 0;
        toddlerScoreEl.textContent = toddlerScore;
        nextToddlerRound();
    }

    function nextToddlerRound() {
        // Random number 1-5 (easy start)
        const count = Math.floor(Math.random() * 5) + 1;
        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

        // Render Emojis
        const display = document.getElementById('emoji-display');
        display.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const span = document.createElement('span');
            span.textContent = emoji;
            // Stagger animation
            span.style.animation = `bounceIn 0.5s ease ${i * 0.1}s backwards`;
            display.appendChild(span);
        }

        // Render Options (1-5)
        const optionsDiv = document.getElementById('toddler-options');
        optionsDiv.innerHTML = '';
        /* Always show 1-5 to keep it simple layout-wise */
        for (let i = 1; i <= 5; i++) {
            const btn = document.createElement('button');
            btn.className = 'btn-toddler-opt';
            btn.textContent = i;
            btn.onclick = () => checkToddlerAnswer(i, count);
            optionsDiv.appendChild(btn);
        }

        // Clear feedback
        document.getElementById('toddler-feedback').textContent = '';
        document.getElementById('toddler-feedback').className = 'feedback-msg';
    }

    function checkToddlerAnswer(selected, correct) {
        const feedback = document.getElementById('toddler-feedback');
        if (selected === correct) {
            feedback.textContent = "Yay! Good Job! 🎉";
            feedback.className = 'feedback-msg feedback-correct';
            toddlerScore++;
            toddlerScoreEl.textContent = toddlerScore;
            // Next round after delay
            setTimeout(nextToddlerRound, 1500);
        } else {
            feedback.textContent = "Oops! Try Again! 🤔";
            feedback.className = 'feedback-msg feedback-wrong';
        }
    }

    /* --- STUDENT GAME (Math Drills) --- */
    let currentOp = 'add';

    window.initStudentGame = (op) => {
        currentOp = op;
        document.getElementById('student-menu').classList.add('hidden');
        document.getElementById('student-numpad').classList.remove('hidden');

        // Reset or Resume? User didn't ask to reset ON OPEN, only on fail. 
        // But if they quitted, we might want to resume. 
        // For now, let's keep state unless app closed (which variables handle).
        // Just update UI to match current state.
        document.getElementById('student-score-val').textContent = studentScore;
        document.getElementById('student-level').textContent = studentLevel;
        document.getElementById('student-answer').textContent = "?";

        // Progress Bar
        const progress = (studentScore % 100);
        studentProgressEl.style.width = `${progress}%`;

        nextStudentQuestion();
    };

    function nextStudentQuestion() {
        // Difficulty scaling up to Level 50
        // Base range starts at 10, increases by 5 per level.
        // Lvl 1: 15, Lvl 50: 260
        const maxVal = 10 + (studentLevel * 5);
        const minVal = 1;

        let n1 = Math.floor(Math.random() * maxVal) + minVal;
        let n2 = Math.floor(Math.random() * maxVal) + minVal;
        let qText = "";
        let ans = 0;

        switch (currentOp) {
            case 'add':
                ans = n1 + n2;
                qText = `${n1} + ${n2}`;
                break;
            case 'sub':
                // Ensure positive result
                if (n1 < n2) [n1, n2] = [n2, n1];
                ans = n1 - n2;
                qText = `${n1} - ${n2}`;
                break;
            case 'mul':
                // Smaller numbers for multiply
                n1 = Math.floor(Math.random() * (5 + studentLevel)) + 1;
                n2 = Math.floor(Math.random() * (5 + studentLevel)) + 1;
                ans = n1 * n2;
                qText = `${n1} × ${n2}`;
                break;
            case 'div':
                // Ensure clean division
                n2 = Math.floor(Math.random() * (4 + studentLevel)) + 1;
                ans = Math.floor(Math.random() * (5 + studentLevel)) + 1;
                n1 = n2 * ans;
                qText = `${n1} ÷ ${n2}`;
                break;
        }

        currentQuestion = { a: ans };
        document.getElementById('student-question').textContent = qText;
        document.getElementById('student-answer').textContent = "";
        startTimer();
    }

    // Student Input Handler
    const studentNumpad = document.querySelectorAll('#student-numpad .g-btn');
    studentNumpad.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const num = btn.dataset.num;
            const display = document.getElementById('student-answer');

            if (num !== undefined) {
                if (display.textContent === "?" || display.textContent === "Correct!") display.textContent = "";
                display.textContent += num;
            } else if (action === 'del') {
                let s = display.textContent;
                if (s !== "?" && s.length > 0) display.textContent = s.slice(0, -1);
            } else if (action === 'enter') {
                checkStudentAnswer(parseInt(display.textContent));
            }
        });
    });

    function checkStudentAnswer(userAns) {
        if (userAns === currentQuestion.a) {
            stopTimer();
            document.getElementById('student-question').textContent = "Correct! 🎉";
            studentScore += 10;
            document.getElementById('student-score-val').textContent = studentScore;

            // Visual +10 Feedback
            const feedback = document.createElement('div');
            feedback.className = 'score-float';
            feedback.textContent = '+10';
            const rect = document.getElementById('student-answer').getBoundingClientRect();
            feedback.style.left = `${rect.left + rect.width / 2}px`;
            feedback.style.top = `${rect.top}px`;
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 1000);

            // Level Up logic
            if (studentScore % 50 === 0) {
                studentLevel++;
                studentLevelEl.textContent = studentLevel;
            }

            // Progress Bar
            const progress = (studentScore % 100);
            studentProgressEl.style.width = `${progress}%`;

            setTimeout(nextStudentQuestion, 1000);
        } else {
            handlePenalty();
        }
    }



    /* --- Timer Logic --- */
    function startTimer() {
        stopTimer();
        timeLeft = 10;
        updateTimerDisplay();

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                stopTimer();
                handleTimeout();
            }
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function updateTimerDisplay() {
        const timerEl = document.getElementById('student-timer');
        if (timerEl) {
            timerEl.textContent = `⏳ ${timeLeft}s`;
            // Visual feedback for low time
            if (timeLeft <= 5) {
                timerEl.style.color = '#ff6b6b';
                timerEl.style.animation = 'pulse 0.5s infinite alternate';
            } else {
                timerEl.style.color = 'white';
                timerEl.style.animation = 'none';
            }
        }
    }

    function handleTimeout() {
        handlePenalty(true);
    }

    function handlePenalty(isTimeout = false) {
        stopTimer();
        const baseScore = (studentLevel - 1) * 50;
        let msg = "";

        if (studentScore > baseScore) {
            // Reset to current level start
            studentScore = baseScore;
            msg = isTimeout ? "Time's Up! Reset! 📉" : "Wrong! Reset! 📉";
        } else {
            // Already at start, demote
            if (studentLevel > 1) {
                studentLevel--;
                studentScore = (studentLevel - 1) * 50;
                studentLevelEl.textContent = studentLevel;
                msg = isTimeout ? "Time's Up! Dropped! 📉" : "Wrong! Dropped! 📉";
            } else {
                studentScore = 0;
                msg = isTimeout ? "Time's Up! 📉" : "Wrong! 📉";
            }
        }

        // Update UI
        document.getElementById('student-question').textContent = msg;
        document.getElementById('student-score-val').textContent = studentScore;
        const progress = (studentScore % 100);
        studentProgressEl.style.width = `${progress}%`;

        document.getElementById('student-answer').classList.add('shake');
        setTimeout(() => document.getElementById('student-answer').classList.remove('shake'), 400);
        setTimeout(nextStudentQuestion, 1500);
    }

});
