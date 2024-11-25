// content.js
function initializeExtension() {
    console.log('DFS Extension activated');

    const container = document.createElement('div');
    container.id = 'dfs-extension-results';
    container.style.position = 'fixed';
    container.style.top = '50px';
    container.style.right = '10px';
    container.style.width = '800px'; // Increased width for new column
    container.style.maxHeight = '80vh';
    container.style.overflowY = 'auto';
    container.style.backgroundColor = 'white';
    container.style.padding = '15px';
    container.style.borderRadius = '5px';
    container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    container.style.zIndex = '9999';
    container.style.display = 'none';

    // Add unit size input
    const inputContainer = document.createElement('div');
    inputContainer.style.marginBottom = '10px';
    inputContainer.style.display = 'flex';
    inputContainer.style.alignItems = 'center';
    inputContainer.style.gap = '10px';

    const label = document.createElement('label');
    label.textContent = 'Unit Size: $';
    label.style.fontWeight = 'bold';

    const unitSizeInput = document.createElement('input');
    unitSizeInput.type = 'number';
    unitSizeInput.id = 'unit-size-input';
    unitSizeInput.style.padding = '5px';
    unitSizeInput.style.width = '100px';
    unitSizeInput.value = '100'; // Default value

    inputContainer.appendChild(label);
    inputContainer.appendChild(unitSizeInput);

    // Add update button
    const updateButton = document.createElement('button');
    updateButton.textContent = 'Update';
    updateButton.style.padding = '5px 10px';
    updateButton.style.backgroundColor = '#4CAF50';
    updateButton.style.color = 'white';
    updateButton.style.border = 'none';
    updateButton.style.borderRadius = '3px';
    updateButton.style.cursor = 'pointer';
    updateButton.onclick = analyzeRows;

    inputContainer.appendChild(updateButton);

    // Rest of the buttons
    const analyzeButton = document.createElement('button');
    analyzeButton.textContent = 'Analyze Data';
    analyzeButton.style.position = 'fixed';
    analyzeButton.style.top = '10px';
    analyzeButton.style.right = '10px';
    analyzeButton.style.padding = '10px';
    analyzeButton.style.backgroundColor = '#4CAF50';
    analyzeButton.style.color = 'white';
    analyzeButton.style.border = 'none';
    analyzeButton.style.borderRadius = '5px';
    analyzeButton.style.cursor = 'pointer';
    analyzeButton.style.zIndex = '9999';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.padding = '5px 10px';
    closeButton.style.backgroundColor = '#ff4444';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '3px';
    closeButton.style.cursor = 'pointer';

    container.appendChild(inputContainer);
    container.appendChild(closeButton);
    document.body.appendChild(container);
    document.body.appendChild(analyzeButton);

    analyzeButton.addEventListener('click', () => {
        analyzeRows();
        container.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        container.style.display = 'none';
    });
}

// Utility function for Kelly calculation
function calculateKelly(decimalOdds, winProb) {
    const b = decimalOdds; // Convert decimal odds to b
    const q = 1 - winProb;     // Probability of losing
    const kelly = (winProb * decimalOdds - q) / b
    // .0769230769230769 * (.9497 * .0503) / .0769230769230769 * 100

    console.log("Decimal - 1:", b, "Win probability:",winProb, "losing probability:", q, "kelly:", kelly)

    return Math.max(kelly, 0); // Kelly can't be negative for betting
}

// Only showing the modified analyzeRows function - the rest remains the same
function analyzeRows() {
    const container = document.getElementById('dfs-extension-results');
    // Preserve the input container
    const inputContainer = container.querySelector('div');
    container.innerHTML = '<button style="position:absolute;top:5px;right:5px;padding:5px 10px;background-color:#ff4444;color:white;border:none;border-radius:3px;cursor:pointer;">X</button>';
    container.appendChild(inputContainer);

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '10px';

    const headerRow = document.createElement('tr');
    headerRow.style.backgroundColor = '#f5f5f5';
    headerRow.style.fontWeight = 'bold';

    const headers = ['Name', 'Odds', 'Win Percentage', 'Kelly', 'Bet Size'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.style.padding = '10px';
        th.style.textAlign = 'left';
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    const unitSize = parseFloat(document.getElementById('unit-size-input').value) || 100;

    const rows = document.querySelectorAll('tr');

    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');

        if (cells.length >= 8) {
            const resultRow = document.createElement('tr');
            resultRow.style.borderBottom = '1px solid #eee';

            let name = '';
            let odds = '';
            let winPercentage = '';

            [1, 6, 7].forEach((cellIndex, i) => {
                if (cellIndex === 1) {
                    const specificP = cells[cellIndex].querySelector('p.text-sm.text-white.__className_179fbf');
                    name = specificP ? specificP.textContent.trim() : cells[cellIndex].textContent.trim();
                } else if (cellIndex === 6) {
                    odds = cells[cellIndex].textContent.trim();
                } else if (cellIndex === 7) {
                    winPercentage = cells[cellIndex].textContent.trim();
                }
            });

            const createCell = (content) => {
                const cell = document.createElement('td');
                cell.style.padding = '10px';
                cell.style.fontSize = '14px';
                cell.textContent = content;
                return cell;
            };

            resultRow.appendChild(createCell(name));
            resultRow.appendChild(createCell(odds));
            resultRow.appendChild(createCell(winPercentage));

            try {
                const bookOddsValue = parseFloat(odds);
                const winP = parseFloat(winPercentage) / 100;
                let decimalOdds;
                if (bookOddsValue > 0) {
                    decimalOdds = bookOddsValue / 100
                }
                else {
                    decimalOdds = -100 / bookOddsValue
                }

                const kellyPct = calculateKelly(decimalOdds, winP);
                resultRow.appendChild(createCell((kellyPct * 100).toFixed(1)));

                // Calculate and add bet size
                const betSize = (unitSize / 2) * kellyPct * 100;
                resultRow.appendChild(createCell('$' + betSize.toFixed(2)));

            } catch (e) {
                console.log('Calculation error:', e);
                resultRow.appendChild(createCell('N/A'));
                resultRow.appendChild(createCell('N/A'));
            }

            table.appendChild(resultRow);
        }
    });

    container.appendChild(table);

    const closeButton = container.querySelector('button');
    closeButton.addEventListener('click', () => {
        container.style.display = 'none';
    });
}

// Initialize when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}

// Handle dynamic content
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            // If the results container doesn't exist, reinitialize
            if (!document.getElementById('dfs-extension-results')) {
                initializeExtension();
            }
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});