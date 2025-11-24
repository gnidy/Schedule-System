// Application state
const state = {
    employees: [],
    currentWeekStart: null,
    showOnlyWorking: false,
    // Available roles with their display names and colors
    roles: {
        'Manager': { color: '#f15a24', icon: 'bi-star-fill' },
        'Supervisor': { color: '#ffc107', icon: 'bi-shield-check' },
        'Team Member': { color: '#6c757d', icon: 'bi-person' },
        'Delivery Driver': { color: '#0d6efd', icon: 'bi-truck' },
        'Cook': { color: '#dc3545', icon: 'bi-egg-fried' },
        'Cashier': { color: '#198754', icon: 'bi-cash-coin' }
    },
    // Available shifts with their display names and colors
    shifts: {
        '7--4': { name: 'Morning', color: '#e8f5e9', textColor: '#2e7d32' },
        '8--5': { name: 'Day', color: '#e3f2fd', textColor: '#1565c0' },
        '12--9': { name: 'Swing', color: '#fff3e0', textColor: '#e65100' },
        '5--2': { name: 'Evening', color: '#f3e5f5', textColor: '#7b1fa2' },
        '12--12': { name: 'Double', color: '#e8eaf6', textColor: '#303f9f' },
        'OFF': { name: 'OFF', color: '#ffebee', textColor: '#d32f2f' }
    },
    // Days of the week in order
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};

// Create and append styles
const style = document.createElement('style');
style.textContent = `
    .off {
        background-color: #fff3cd !important;
        color: #856404;
        font-weight: bold;
    }
    
    .shift-7-4, .shift-8-5 {
        background-color: #e8f5e9; /* Light green for morning shifts */
    }
    .shift-12-9 {
        background-color: #fff3e0; /* Light orange for evening shifts */
    }
    .shift-5-2 {
        background-color: #f3e5f5; /* Light purple for night shifts */
    }
    .shift-12-12 {
        background-color: #ffebee; /* Light red for long shifts */
    }
    
    .manager { 
        border-left: 3px solid #f15a24;
        font-weight: bold;
    }
    
    .supervisor { 
        border-left: 3px solid #ffc107;
        font-weight: bold;
    }
    
    table {
        border-collapse: collapse;
        width: 100%;
    }
    
    th, td {
        border: 1px solid #dee2e6;
        padding: 8px;
        text-align: center;
    }
    
    th {
        background-color: #f8f9fa;
        position: sticky;
        top: 0;
    }
    
    tr:nth-child(even) {
        background-color: #f8f9fa;
    }
    
    tr:hover {
        background-color: #e9ecef;
    }
    
    @media print {
        body * {
            visibility: hidden;
        }
        #schedule, #schedule * {
            visibility: visible;
        }
        #schedule {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
        }
    }
`;
document.head.appendChild(style);

// Initialize sample employees if none exist in localStorage
function initializeSampleData() {
    if (state.employees.length === 0) {
        // Clear any existing employees
        state.employees = [];
        state.employees = [
            createEmployee('DIDIER', 'Manager', {
                'Friday': '8--5', 'Saturday': '8--5', 'Sunday': '8--5',
                'Monday': 'OFF', 'Tuesday': 'OFF', 'Wednesday': '12--12', 'Thursday': '12--12'
            }),
            createEmployee('MAHMOUD', 'Supervisor', {
                'Friday': '12--9', 'Saturday': '12--9', 'Sunday': '12--9',
                'Monday': '12--9', 'Tuesday': '12--9', 'Wednesday': 'OFF', 'Thursday': 'OFF'
            }),
            createEmployee('GEOFFREY', 'Team Member', {
                'Friday': '8--5', 'Saturday': '8--5', 'Sunday': '8--5',
                'Monday': '8--5', 'Tuesday': 'OFF', 'Wednesday': '8--5', 'Thursday': '8--5'
            }),
            createEmployee('FAISAL', 'Team Member', {
                'Friday': '12--9', 'Saturday': '12--9', 'Sunday': '12--9',
                'Monday': '12--9', 'Tuesday': '12--9', 'Wednesday': '12--9', 'Thursday': '12--9'
            }),
            createEmployee('ABDULRAHMAN', 'Team Member', {
                'Friday': '5--2', 'Saturday': '5--2', 'Sunday': '5--2',
                'Monday': '5--2', 'Tuesday': '5--2', 'Wednesday': '5--2', 'Thursday': '5--2'
            }),
            createEmployee('MOHAMMED', 'Team Member', {
                'Friday': '7--4', 'Saturday': '7--4', 'Sunday': '7--4',
                'Monday': '7--4', 'Tuesday': '7--4', 'Wednesday': '7--4', 'Thursday': '7--4'
            })
        ];
        saveToLocalStorage();
    }
}

// Create a new employee object
function createEmployee(name, role, shifts = {}) {
    const defaultShifts = {};
    state.days.forEach(day => {
        defaultShifts[day] = shifts[day] || 'OFF';
    });
    
    const employee = {
        id: Date.now() + Math.floor(Math.random() * 1000), // Simple unique ID
        name: name.trim(),
        role: role || 'Team Member',
        shifts: { ...defaultShifts, ...shifts },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    state.employees.push(employee);
    saveToLocalStorage();
    return employee;
}

// Get the current week's start date (Sunday)
function getWeekStartDate(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // 0 for Sunday, 1 for Monday, etc.
    return new Date(d.setDate(diff));
}

// Generate dates for the current week
function getWeekDates(startDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + i);
        
        dates.push({
            date: date.getDate(),
            day: state.days[date.getDay()],
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            fullDate: new Date(date)
        });
    }
    
    return dates;
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Format date as "Day, Month DD, YYYY"
function formatDisplayDate(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// Get week range text (e.g., "Oct 2 - Oct 8, 2023")
function getWeekRangeText(startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const startMonth = startDate.toLocaleString('default', { month: 'short' });
    const endMonth = endDate.toLocaleString('default', { month: 'short' });
    const year = startDate.getFullYear();
    
    if (startMonth === endMonth) {
        return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}, ${year}`;
    } else {
        return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${year}`;
    }
}

// Parse shift input from user
function parseShiftInput(input) {
    if (!input) return 'OFF';
    
    const trimmed = input.toString().trim().toUpperCase();
    
    // Handle 'OFF' case
    if (trimmed === 'OFF') return 'OFF';
    
    // Try to parse time formats like 8-5, 8:00-17:00, 8am-5pm, etc.
    const timeRegex = /^(\d{1,2})(?::(\d{2}))?\s*([aApP][mM]?)?\s*-\s*(\d{1,2})(?::(\d{2}))?\s*([aApP][mM]?)?$/;
    const match = trimmed.match(timeRegex);
    
    if (match) {
        let [_, startHr, startMin, startPeriod, endHr, endMin, endPeriod] = match;
        
        // Convert to 24-hour format
        const parseHour = (hour, period) => {
            hour = parseInt(hour, 10);
            period = (period || '').toLowerCase();
            
            if (period.includes('p') && hour < 12) {
                hour += 12;
            } else if (period.includes('a') && hour === 12) {
                hour = 0;
            }
            
            return hour;
        };
        
        const startHour = parseHour(startHr, startPeriod);
        const endHour = parseHour(endHr, endPeriod);
        
        // Map to closest standard shift
        const shiftMap = {
            '7--4': { start: 7, end: 16 },
            '8--5': { start: 8, end: 17 },
            '12--9': { start: 12, end: 21 },
            '5--2': { start: 17, end: 2 },
            '12--12': { start: 12, end: 12 }
        };
        
        let closestShift = '8--5';
        let minDiff = Infinity;
        
        Object.entries(shiftMap).forEach(([shift, { start, end }]) => {
            const startDiff = Math.abs(start - startHour);
            const endDiff = Math.abs((end === 2 ? 26 : end) - (endHour < 6 ? endHour + 24 : endHour));
            const totalDiff = startDiff + endDiff;
            
            if (totalDiff < minDiff) {
                minDiff = totalDiff;
                closestShift = shift;
            }
        });
        
        return closestShift;
    }
    
    // If no match, check if it's a known shift
    if (state.shifts[trimmed]) {
        return trimmed;
    }
    
    // Default to OFF if input is not recognized
    return 'OFF';
}

// Get shift display text
function getShiftDisplay(shift) {
    return state.shifts[shift]?.name || shift;
}

// Update the current week display
function updateWeekDisplay() {
    const weekStart = state.currentWeekStart;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    document.getElementById('currentWeek').textContent = getWeekRangeText(weekStart);
    
    // Highlight today's date
    const today = new Date();
    const weekDates = getWeekDates(weekStart);
    
    weekDates.forEach((date, index) => {
        const isToday = date.date === today.getDate() && 
                        date.month === today.getMonth() + 1 && 
                        date.year === today.getFullYear();
        
        const dayElement = document.querySelector(`.date-header[data-day="${date.day}"]`);
        if (dayElement) {
            dayElement.classList.toggle('today', isToday);
        }
    });
}

// Render the schedule table
function renderSchedule() {
    const scheduleContainer = document.getElementById('schedule');
    const weekDates = getWeekDates(state.currentWeekStart);
    
    // Filter employees based on showOnlyWorking filter
    const filteredEmployees = state.showOnlyWorking 
        ? state.employees.filter(emp => 
            Object.values(emp.shifts).some(shift => shift !== 'OFF')
          )
        : [...state.employees];
    
    // Sort employees by role (managers first, then supervisors, then others)
    const roleOrder = { 'Manager': 1, 'Supervisor': 2 };
    filteredEmployees.sort((a, b) => {
        const roleA = roleOrder[a.role] || 3;
        const roleB = roleOrder[b.role] || 3;
        return roleA - roleB || a.name.localeCompare(b.name);
    });
    
    // Create table element
    const table = document.createElement('table');
    table.className = 'table table-hover align-middle';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Add employee header
    const employeeHeader = document.createElement('th');
    employeeHeader.textContent = 'Employee';
    employeeHeader.style.minWidth = '150px'; // Set a min-width instead of fixed
    headerRow.appendChild(employeeHeader);
    
    // Add date headers
    weekDates.forEach(dateInfo => {
        const th = document.createElement('th');
        th.className = 'text-center';
        th.innerHTML = `
            <div class="d-flex flex-column">
                <span class="date-header fw-bold" data-day="${dateInfo.day}">${dateInfo.day.substring(0, 3)}</span>
                <span class="small">${dateInfo.month}/${dateInfo.date}</span>
            </div>
        `;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    if (filteredEmployees.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 8;
        emptyCell.className = 'text-center py-4 text-muted';
        emptyCell.textContent = state.showOnlyWorking 
            ? 'No employees are scheduled to work this week.' 
            : 'No employees found. Click "Add Employee" to get started.';
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
    } else {
        // Add employee rows
        filteredEmployees.forEach(employee => {
            const row = document.createElement('tr');
            
            // Add employee info cell
            const nameCell = document.createElement('td');
            nameCell.className = 'position-relative';
            
            // Add role-based styling
            const roleInfo = state.roles[employee.role] || {};
            const roleClass = employee.role === 'Manager' ? 'manager' : 
                             employee.role === 'Supervisor' ? 'supervisor' : '';
            
            nameCell.innerHTML = `
                <div class="d-flex align-items-center ${roleClass} ps-2 py-1">
                    ${roleInfo.icon ? `<i class="${roleInfo.icon} me-2" style="color: ${roleInfo.color}"></i>` : ''}
                    <div>
                        <div class="employee-name">${employee.name}</div>
                        <small class="employee-role">${employee.role}</small>
                    </div>
                </div>
                <div class="employee-actions position-absolute end-0 top-0 h-100 align-items-center pe-2">
                    <button class="btn btn-sm btn-outline-secondary btn-edit" data-id="${employee.id}" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete ms-1" data-id="${employee.id}" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            
            
            row.appendChild(nameCell);
            
            // Add shift cells for each day
            weekDates.forEach(dateInfo => {
                const cell = document.createElement('td');
                cell.className = 'shift-cell text-center';
                
                const shift = employee.shifts[dateInfo.day] || 'OFF';
                const shiftInfo = state.shifts[shift] || {};
                
                // Set cell content and styling
                cell.textContent = getShiftDisplay(shift);
                cell.contentEditable = 'true';
                cell.style.backgroundColor = shiftInfo.color || 'transparent';
                cell.style.color = shiftInfo.textColor || 'inherit';
                cell.style.borderRadius = '4px';
                cell.style.padding = '8px 4px';
                cell.style.transition = 'all 0.2s';
                
                // Add data attributes for easy reference
                cell.dataset.employeeId = employee.id;
                cell.dataset.day = dateInfo.day;
                
                // Add event listeners for editing shifts
                cell.addEventListener('click', (e) => {
                    if (cell.contentEditable === 'true') {
                        e.stopPropagation();
                        cell.focus();
                    }
                });
                
                cell.addEventListener('focus', () => {
                    cell.style.boxShadow = '0 0 0 2px rgba(241, 90, 36, 0.5)';
                    cell.style.zIndex = '10';
                    cell.style.position = 'relative';
                });
                
                cell.addEventListener('blur', () => {
                    const day = cell.dataset.day;
                    const input = cell.textContent.trim();
                    const newShift = parseShiftInput(input);
                    
                    if (newShift !== null) {
                        employee.shifts[day] = newShift === 'OFF' ? undefined : newShift;
                        updateCellAppearance(cell, newShift);
                        saveToLocalStorage();
                    } else {
                        // Revert to previous value if invalid
                        cell.textContent = getShiftDisplay(shift);
                    }
                });
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    
    // Clear and append the schedule container
    scheduleContainer.innerHTML = ''; // Clear previous content
    scheduleContainer.appendChild(table);

    // Add event listeners for edit and delete buttons
    tbody.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-edit');
        const deleteButton = e.target.closest('.btn-delete');

        if (editButton) {
            const employeeId = parseInt(editButton.dataset.id, 10);
            showEditEmployeeModal(employeeId);
        }

        if (deleteButton) {
            const employeeId = parseInt(deleteButton.dataset.id, 10);
            deleteEmployee(employeeId);
        }
    });
    }
}


// Update cell appearance
function updateCellAppearance(cell, shift) {
    // Remove all shift-related classes
    cell.className = '';
    
    if (shift === 'OFF') {
        cell.classList.add('off');
        cell.textContent = 'OFF';
    } else {
        const shiftClass = `shift-${shift.replace('--', '-')}`;
        cell.classList.add(shiftClass);
        cell.textContent = getShiftDisplay(shift);
    }
}

// Save employees to local storage
function saveToLocalStorage() {
    try {
        localStorage.setItem('pizzahutSchedule', JSON.stringify({
            employees: state.employees,
            currentWeekStart: state.currentWeekStart.toISOString(),
            showOnlyWorking: state.showOnlyWorking
        }));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

// Load employees from local storage
function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('pizzahutSchedule');
        if (savedData) {
            const data = JSON.parse(savedData);
            state.employees = data.employees || [];
            if (data.currentWeekStart) {
                state.currentWeekStart = new Date(data.currentWeekStart);
            }
            if (data.showOnlyWorking !== undefined) {
                state.showOnlyWorking = data.showOnlyWorking;
                                const showWorkingOnlyCheckbox = document.getElementById('showOnlyWorking');
                if (showWorkingOnlyCheckbox) {
                    showWorkingOnlyCheckbox.checked = state.showOnlyWorking;
                }
            }
        } else {
            state.employees = [];
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        state.employees = [];
    }
}

// =================================================================================
// Initialization & Event Listeners
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded. Initializing application...');
    
    // Load data from local storage
    loadFromLocalStorage();

    // If no week start is loaded, set it to the current week's Sunday
    if (!state.currentWeekStart) {
        state.currentWeekStart = getWeekStartDate(new Date());
    }

    // Initialize sample data if no employees exist
    if (state.employees.length === 0) {
        console.log('No employees found. Initializing sample data.');
        initializeSampleData();
    }

    // Set up all event listeners for buttons and controls
    setupEventListeners();

    // Render the initial schedule display
    updateWeekDisplay();
    renderSchedule();

    console.log('Application initialized successfully.');
});

function navigateWeek(days) {
    state.currentWeekStart.setDate(state.currentWeekStart.getDate() + days);
    updateWeekDisplay();
    renderSchedule();
    saveToLocalStorage();
}

function goToCurrentWeek() {
    state.currentWeekStart = getWeekStartDate(new Date());
    updateWeekDisplay();
    renderSchedule();
    saveToLocalStorage();
}

function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Helper to safely add event listeners
    const addListener = (id, event, handler) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.error(`Element with ID '${id}' not found.`);
        }
    };

    // Main controls
    addListener('addEmployee', 'click', showAddEmployeeModal);
    addListener('generateSchedule', 'click', generateSchedule);
    addListener('printSchedule', 'click', printSchedule);
    addListener('exportExcel', 'click', exportToExcel);
    addListener('exportPDF', 'click', exportToPDF);
   addListener('exportJPG', 'click', exportToJPG);

    // Week navigation
    addListener('prevWeek', 'click', () => navigateWeek(-7));
    addListener('nextWeek', 'click', () => navigateWeek(7));
    addListener('currentWeek', 'click', goToCurrentWeek);
    addListener('todayBtn', 'click', goToCurrentWeek);

    // Other UI controls
        addListener('showOnlyWorking', 'change', (e) => {
        state.showOnlyWorking = e.target.checked;
        renderSchedule();
        saveToLocalStorage();
    });
    
    console.log('Event listeners setup complete.');
}

function showAddEmployeeModal() {
    console.log('`showAddEmployeeModal` called.');

    // Use the existing Bootstrap modal from index.html
    const modalElement = document.getElementById('employeeModal');
    if (!modalElement) {
        console.error('Employee modal not found in HTML.');
        return;
    }

    const employeeModal = new bootstrap.Modal(modalElement);

    // Clear previous input
    document.getElementById('employeeName').value = '';
    document.getElementById('employeeRole').selectedIndex = 0;

    // Setup save button listener
    const saveButton = document.getElementById('saveEmployee');
    
    // Clone and replace the button to remove old listeners
    const newSaveButton = saveButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);

    newSaveButton.addEventListener('click', () => {
        const name = document.getElementById('employeeName').value.trim();
        const role = document.getElementById('employeeRole').value;

        if (name) {
            createEmployee(name, role);
            employeeModal.hide();
        } else {
            alert('Please enter a name for the employee.');
            document.getElementById('employeeName').focus();
        }
    });

    employeeModal.show();
}


function showEditEmployeeModal(employeeId) {
    const employee = state.employees.find(emp => emp.id === employeeId);
    if (!employee) {
        console.error('Employee not found for editing.');
        return;
    }

    const modalElement = document.getElementById('employeeModal');
    const employeeModal = new bootstrap.Modal(modalElement);

    // Update modal for editing
    document.getElementById('employeeModalLabel').textContent = 'Edit Employee';
    document.getElementById('employeeName').value = employee.name;
    document.getElementById('employeeRole').value = employee.role;

    const saveButton = document.getElementById('saveEmployee');
    const newSaveButton = saveButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);

    newSaveButton.textContent = 'Save Changes';
    newSaveButton.addEventListener('click', () => {
        const newName = document.getElementById('employeeName').value.trim();
        const newRole = document.getElementById('employeeRole').value;

        if (newName) {
            employee.name = newName;
            employee.role = newRole;
            employee.updatedAt = new Date().toISOString();
            saveToLocalStorage();
            renderSchedule();
            employeeModal.hide();
        } else {
            alert('Employee name cannot be empty.');
        }
    });

    employeeModal.show();
}

function deleteEmployee(employeeId) {
    const employeeIndex = state.employees.findIndex(emp => emp.id === employeeId);
    if (employeeIndex === -1) {
        console.error('Employee not found for deletion.');
        return;
    }

    const employeeName = state.employees[employeeIndex].name;
    if (confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
        state.employees.splice(employeeIndex, 1);
        saveToLocalStorage();
        renderSchedule();
    }
}

// Generate schedule automatically
function generateSchedule() {
    if (!confirm('This will update shifts for all team members. Continue?')) {
        return;
    }
    
    // Simple scheduling algorithm
    state.employees.forEach((employee, index) => {
        // Skip if manager or supervisor (they have fixed schedules)
        if (['Manager', 'Supervisor'].includes(employee.role)) {
            return;
        }
        
        // For team members, assign shifts based on their position in the array
        const shiftPatterns = ['8--5', '12--9', '5--2', '7--4'];
        const shiftIndex = index % shiftPatterns.length;
        const shift = shiftPatterns[shiftIndex];
        
        // Update shifts for each day
        state.days.forEach(day => {
            employee.shifts[day] = shift;
        });
    });
    
    saveToLocalStorage();
    renderSchedule();
    alert('Schedule generated successfully!');
}

// Print the schedule
function printSchedule() {
    // Add print-specific styles
    const style = document.createElement('style');
    style.textContent = `
        @media print {
            .no-print, .btn, .form-control, .input-group-text {
                display: none !important;
            }
            body {
                background: white;
                font-size: 12px;
            }
            .container {
                max-width: 100%;
                padding: 10px;
                box-shadow: none;
            }
            table {
                width: 100%;
                font-size: 11px;
            }
            th, td {
                padding: 4px !important;
            }
        }
    `;
    
    // Add the styles to the head
    document.head.appendChild(style);
    
    // Print the page
    window.print();
    
    // Remove the styles after printing
    setTimeout(() => {
        document.head.removeChild(style);
    }, 1000);
}

// Export to Excel
function exportToExcel() {
    const table = document.querySelector('#schedule table');
    if (!table) {
        alert('No schedule table found to export.');
        return;
    }
    const wb = XLSX.utils.table_to_book(table, { sheet: "Schedule" });
    XLSX.writeFile(wb, `PizzaHut_Schedule_${formatDate(state.currentWeekStart)}.xlsx`);
}

// Export to PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.autoTable({
        html: '#schedule table',
        startY: 20,
        theme: 'grid',
        headStyles: { fillColor: [241, 90, 36] },
    });

    doc.text(`Pizza Hut Schedule - ${getWeekRangeText(state.currentWeekStart)}`, 14, 15);
    doc.save(`PizzaHut_Schedule_${formatDate(state.currentWeekStart)}.pdf`);
}

// Export to JPG
function exportToJPG() {
    const scheduleElement = document.getElementById('schedule');
    if (!scheduleElement) {
        alert('No schedule found to export.');
        return;
    }

    html2canvas(scheduleElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `PizzaHut_Schedule_${formatDate(state.currentWeekStart)}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
    }).catch(err => {
        console.error('Error exporting to JPG:', err);
        alert('An error occurred while exporting the schedule as a JPG image.');
    });
}

// CSS styles are now defined at the top of the file
