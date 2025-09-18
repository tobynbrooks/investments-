// Global object to store investment histories
let investmentHistories = {};

function addRow() {
    const table = document.getElementById('investmentTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    
    newRow.innerHTML = `
        <td><input type="text" placeholder="e.g. Apple Stock" oninput="updateCalculations(); updateInvestmentSelect()"></td>
        <td>
            <select onchange="updateCalculations()">
                <option value="">Select Type</option>
                <option value="Stocks">Stocks</option>
                <option value="Bonds">Bonds</option>
                <option value="ETF">ETF</option>
                <option value="Mutual Fund">Mutual Fund</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Crypto">Cryptocurrency</option>
                <option value="Cash">Cash/Savings</option>
                <option value="Commodities">Commodities</option>
                <option value="Other">Other</option>
            </select>
        </td>
        <td><input type="number" class="currency current-value" step="0.01" placeholder="0.00" oninput="updateCalculations()"></td>
        <td><input type="number" class="currency initial-value" step="0.01" placeholder="0.00" oninput="updateCalculations()"></td>
        <td class="currency growth-value">$0.00</td>
        <td class="percentage growth-percent">0.00%</td>
        <td class="percentage allocation-percent">0.00%</td>
        <td><input type="number" class="percentage" step="0.01" placeholder="0.00" oninput="updateCalculations()"></td>
        <td><button class="toggle-history" onclick="toggleHistory(this)">View History</button></td>
        <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
    `;
    
    updateCalculations();
    updateInvestmentSelect();
}

function deleteRow(btn) {
    const row = btn.parentNode.parentNode;
    const investmentName = row.cells[0].getElementsByTagName('input')[0].value;
    
    // Remove from history
    if (investmentName && investmentHistories[investmentName]) {
        delete investmentHistories[investmentName];
    }
    
    row.parentNode.removeChild(row);
    updateCalculations();
    updateInvestmentSelect();
}

function addMonthlyUpdate() {
    const selectElement = document.getElementById('updateInvestmentSelect');
    const valueInput = document.getElementById('updateValue');
    const dateInput = document.getElementById('updateDate');
    
    const investmentName = selectElement.value;
    const newValue = parseFloat(valueInput.value);
    const date = dateInput.value;
    
    if (!investmentName || !newValue || !date) {
        alert('Please fill in all fields');
        return;
    }
    
    // Initialize history for this investment if it doesn't exist
    if (!investmentHistories[investmentName]) {
        investmentHistories[investmentName] = [];
    }
    
    // Add new entry to history
    investmentHistories[investmentName].push({
        date: date,
        value: newValue
    });
    
    // Sort by date
    investmentHistories[investmentName].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Update the current value in the main table
    const table = document.getElementById('investmentTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const nameInput = rows[i].cells[0].getElementsByTagName('input')[0];
        if (nameInput.value === investmentName) {
            const currentValueInput = rows[i].cells[2].getElementsByTagName('input')[0];
            currentValueInput.value = newValue;
            break;
        }
    }
    
    // Clear the form
    valueInput.value = '';
    dateInput.value = '';
    
    updateCalculations();
    alert(`Updated ${investmentName} to $${newValue.toLocaleString()} on ${date}`);
}

function updateInvestmentSelect() {
    const select = document.getElementById('updateInvestmentSelect');
    const table = document.getElementById('investmentTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">Select Investment</option>';
    
    // Add current investments to the dropdown
    for (let i = 0; i < rows.length; i++) {
        const nameInput = rows[i].cells[0].getElementsByTagName('input')[0];
        if (nameInput.value.trim()) {
            const option = document.createElement('option');
            option.value = nameInput.value;
            option.textContent = nameInput.value;
            select.appendChild(option);
        }
    }
}

function toggleHistory(btn) {
    const row = btn.closest('tr');
    const investmentName = row.cells[0].getElementsByTagName('input')[0].value;
    
    if (!investmentName) {
        alert('Please enter an investment name first');
        return;
    }
    
    // Check if history section already exists
    let historyRow = row.nextElementSibling;
    if (historyRow && historyRow.classList.contains('history-row')) {
        // Toggle visibility
        const historySection = historyRow.querySelector('.history-section');
        if (historySection.style.display === 'none' || !historySection.style.display) {
            historySection.style.display = 'block';
            btn.textContent = 'Hide History';
        } else {
            historySection.style.display = 'none';
            btn.textContent = 'View History';
        }
        return;
    }
    
    // Create new history row
    historyRow = row.parentNode.insertBefore(document.createElement('tr'), row.nextSibling);
    historyRow.classList.add('history-row');
    
    const historyCell = document.createElement('td');
    historyCell.colSpan = 10;
    historyRow.appendChild(historyCell);
    
    const historySection = document.createElement('div');
    historySection.className = 'history-section';
    historySection.style.display = 'block';
    
    const history = investmentHistories[investmentName] || [];
    
    if (history.length === 0) {
        historySection.innerHTML = '<p>No history available. Use the Monthly Update section to add values.</p>';
    } else {
        let historyHTML = '<h4>Value History for ' + investmentName + '</h4>';
        historyHTML += '<table class="history-table" style="width: 100%;">';
        historyHTML += '<thead><tr><th>Date</th><th>Value ($)</th><th>Change ($)</th><th>Change (%)</th></tr></thead><tbody>';
        
        for (let i = 0; i < history.length; i++) {
            const entry = history[i];
            let change = 0;
            let changePercent = 0;
            let changeClass = '';
            
            if (i > 0) {
                const prevValue = history[i-1].value;
                change = entry.value - prevValue;
                changePercent = prevValue !== 0 ? (change / prevValue * 100) : 0;
                changeClass = change >= 0 ? 'growth' : 'decline';
            }
            
            historyHTML += `<tr>
                <td>${new Date(entry.date).toLocaleDateString()}</td>
                <td>$${entry.value.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="${changeClass}">${change >= 0 ? '+' : ''}$${change.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="${changeClass}">${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%</td>
            </tr>`;
        }
        
        historyHTML += '</tbody></table>';
        historySection.innerHTML = historyHTML;
    }
    
    historyCell.appendChild(historySection);
    btn.textContent = 'Hide History';
}

function updateCalculations() {
    const table = document.getElementById('investmentTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    let totalValue = 0;
    let totalInitialValue = 0;
    let assetTypes = {};

    // Calculate totals and individual growth
    for (let i = 0; i < rows.length; i++) {
        const inputs = rows[i].getElementsByTagName('input');
        
        const currentValue = parseFloat(inputs[2].value) || 0;
        const initialValue = parseFloat(inputs[3].value) || 0;
        const assetType = rows[i].getElementsByTagName('select')[0].value;

        totalValue += currentValue;
        totalInitialValue += initialValue;

        // Calculate individual growth
        const growth = currentValue - initialValue;
        const growthPercent = initialValue > 0 ? (growth / initialValue * 100) : 0;
        
        // Update growth displays
        const growthValueCell = rows[i].cells[4];
        const growthPercentCell = rows[i].cells[5];
        
        growthValueCell.textContent = '$' + growth.toLocaleString('en-US', {minimumFractionDigits: 2});
        growthValueCell.className = 'currency ' + (growth >= 0 ? 'growth' : 'decline');
        
        growthPercentCell.textContent = growthPercent.toFixed(2) + '%';
        growthPercentCell.className = 'percentage ' + (growth >= 0 ? 'growth' : 'decline');

        // Group by asset type
        if (assetType && currentValue > 0) {
            if (!assetTypes[assetType]) {
                assetTypes[assetType] = { currentValue: 0, initialValue: 0 };
            }
            assetTypes[assetType].currentValue += currentValue;
            assetTypes[assetType].initialValue += initialValue;
        }
    }

    // Update allocations
    for (let i = 0; i < rows.length; i++) {
        const currentValue = parseFloat(rows[i].cells[2].getElementsByTagName('input')[0].value) || 0;
        const allocation = totalValue > 0 ? (currentValue / totalValue * 100) : 0;
        rows[i].cells[6].textContent = allocation.toFixed(2) + '%';
    }

    // Update dashboard
    const totalGrowth = totalValue - totalInitialValue;
    document.getElementById('totalValue').textContent = '$' + totalValue.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('totalGrowth').textContent = '$' + totalGrowth.toLocaleString('en-US', {minimumFractionDigits: 2});
    
    // Calculate monthly growth (simplified - could be enhanced with actual monthly data)
    const avgMonthlyReturn = totalInitialValue > 0 ? (totalGrowth / totalInitialValue * 100) : 0;
    document.getElementById('avgMonthlyReturn').textContent = avgMonthlyReturn.toFixed(2) + '%';
    document.getElementById('monthlyGrowth').textContent = '$' + (totalGrowth * 0.1).toLocaleString('en-US', {minimumFractionDigits: 2}); // Placeholder

    // Update allocation table
    updateAllocationTable(assetTypes, totalValue);
}

function updateAllocationTable(assetTypes, totalValue) {
    const tbody = document.getElementById('allocationBody');
    tbody.innerHTML = '';

    Object.keys(assetTypes).forEach(type => {
        const row = tbody.insertRow();
        const percentage = totalValue > 0 ? (assetTypes[type].currentValue / totalValue * 100) : 0;
        const growth = assetTypes[type].currentValue - assetTypes[type].initialValue;
        
        row.innerHTML = `
            <td>${type}</td>
            <td>$${assetTypes[type].currentValue.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            <td>${percentage.toFixed(2)}%</td>
            <td class="${growth >= 0 ? 'growth' : 'decline'}">$${growth.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        `;
    });
}

function exportToCSV() {
    let csv = [];
    
    // Investment data
    csv.push(['=== INVESTMENT HOLDINGS ===']);
    csv.push(['Investment Name', 'Asset Type', 'Current Value', 'Initial Value', 'Total Growth', 'Growth %', 'Allocation %', 'Tax Rate %']);
    
    const table = document.getElementById('investmentTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const row = [];
        const inputs = rows[i].getElementsByTagName('input');
        const select = rows[i].getElementsByTagName('select')[0];
        
        row.push(inputs[0].value || '');
        row.push(select.value || '');
        row.push(inputs[2].value || '0');
        row.push(inputs[3].value || '0');
        row.push(rows[i].cells[4].textContent.replace('$', '').replace(',', ''));
        row.push(rows[i].cells[5].textContent.replace('%', ''));
        row.push(rows[i].cells[6].textContent.replace('%', ''));
        row.push(inputs[4].value || '0');
        
        csv.push(row);
    }
    
    // Add history data
    csv.push([]);
    csv.push(['=== INVESTMENT HISTORY ===']);
    
    Object.keys(investmentHistories).forEach(investmentName => {
        csv.push([]);
        csv.push([investmentName + ' History']);
        csv.push(['Date', 'Value']);
        
        investmentHistories[investmentName].forEach(entry => {
            csv.push([entry.date, entry.value]);
        });
    });

    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'investment_portfolio_with_history_' + new Date().toISOString().slice(0, 10) + '.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Set today's date as default
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('updateDate').value = today;
    updateInvestmentSelect();
});
