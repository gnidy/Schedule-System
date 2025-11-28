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
        '7--4': { name: '7-4', color: '#e8f5e9', textColor: '#2e7d32' },
        '8--5': { name: '8-5', color: '#e3f2fd', textColor: '#1565c0' },
        '12--9': { name: '12-9', color: '#fff3e0', textColor: '#e65100' },
        '5--2': { name: '5-2', color: '#f3e5f5', textColor: '#7b1fa2' },
        '12--12': { name: '12-12', color: '#e8eaf6', textColor: '#303f9f' },
        'OFF': { name: 'OFF', color: '#ffebee', textColor: '#d32f2f' }
    },
    // Days of the week starting with Friday
    days: ['Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
};


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

// Get the current week's start date (Friday)
function getWeekStartDate(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    // Calculate days to previous Friday (5 is Friday, 0 is Sunday)
    // If today is Sunday (0), go back 2 days to get to Friday
    // Otherwise, go back (day + 2) % 7 days to get to the most recent Friday
    const daysToFriday = (day + 2) % 7;
    const diff = d.getDate() - daysToFriday;
    return new Date(d.setDate(diff));
}

// Generate dates for the current week starting with Friday
function getWeekDates(startDate) {
    const dates = [];
    const today = new Date();
    const currentDate = new Date(startDate);
    
    // Find the most recent Friday
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
    const daysToFriday = (dayOfWeek + 2) % 7; // Calculate days to subtract to get to Friday
    const friday = new Date(today);
    friday.setDate(today.getDate() - daysToFriday);
    
    // Generate dates from Friday to Thursday
    for (let i = 0; i < 7; i++) {
        const date = new Date(friday);
        date.setDate(friday.getDate() + i);
        
        dates.push({
            date: date.getDate(),
            day: state.days[i],
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            fullDate: new Date(date),
            isToday: date.toDateString() === today.toDateString()
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
                
                // Ensure we're using the correct day name format (capitalized)
                const dayName = dateInfo.day.charAt(0).toUpperCase() + dateInfo.day.slice(1).toLowerCase();
                const shift = employee.shifts[dayName] || 'OFF';
                const shiftInfo = state.shifts[shift] || {};
                
                // Create an inner div for content and styling
                const contentDiv = document.createElement('div');
                contentDiv.className = 'shift-content';
                contentDiv.textContent = getShiftDisplay(shift);
                contentDiv.style.backgroundColor = shiftInfo.color || 'transparent';
                contentDiv.style.color = shiftInfo.textColor || 'inherit';
                contentDiv.style.borderRadius = '4px';
                contentDiv.style.padding = '8px 4px';
                contentDiv.style.transition = 'all 0.2s';
                cell.appendChild(contentDiv);

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'shift-actions position-absolute end-0 top-0 h-100 align-items-center pe-2';
                actionsDiv.innerHTML = `
                    <button class="btn btn-sm btn-outline-secondary btn-edit-shift" data-id="${employee.id}" data-day="${dateInfo.day}" title="Edit Shift">
                        <i class="bi bi-pencil"></i>
                    </button>
                `;
                cell.appendChild(actionsDiv);
                
                // Add data attributes for easy reference
                cell.dataset.employeeId = employee.id;
                cell.dataset.day = dateInfo.day;
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    
    // Clear and append the schedule container
    scheduleContainer.innerHTML = ''; // Clear previous content
    scheduleContainer.appendChild(table);

    // Add event listeners for row clicks and button clicks
    tbody.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        const editButton = e.target.closest('.btn-edit');
        const deleteButton = e.target.closest('.btn-delete');
        const editShiftButton = e.target.closest('.btn-edit-shift');

        if (editButton) {
            e.stopPropagation(); // Prevent row click from firing
            const employeeId = parseInt(editButton.dataset.id, 10);
            showEditEmployeeModal(employeeId);
            return;
        }

        if (deleteButton) {
            e.stopPropagation(); // Prevent row click from firing
            const employeeId = parseInt(deleteButton.dataset.id, 10);
            deleteEmployee(employeeId);
            return;
        }

        if (editShiftButton) {
            e.stopPropagation();
            const employeeId = parseInt(editShiftButton.dataset.id, 10);
            const day = editShiftButton.dataset.day;
            showEditShiftModal(employeeId, day);
            return;
        }

        // Toggle actions visibility on row click
        // If the click is on the name cell (and not on a button), toggle actions
        const nameCell = e.target.closest('td:first-child');
        const shiftCell = e.target.closest('.shift-cell');

        if (nameCell && !editButton && !deleteButton) {
            const clickedRow = nameCell.parentElement;
            const isVisible = clickedRow.classList.contains('actions-visible');

            // Hide actions on all rows and cells
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('actions-visible'));
            tbody.querySelectorAll('.shift-cell').forEach(c => c.classList.remove('actions-visible'));

            // If it wasn't already visible, show it
            if (!isVisible) {
                clickedRow.classList.add('actions-visible');
            }
        } else if (shiftCell && !editShiftButton) {
            const isVisible = shiftCell.classList.contains('actions-visible');

            // Hide actions on all rows and cells
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('actions-visible'));
            tbody.querySelectorAll('.shift-cell').forEach(c => c.classList.remove('actions-visible'));

            if (!isVisible) {
                shiftCell.classList.add('actions-visible');
            }
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

// Date navigation functions removed as per requirements

function setupEventListeners() {
    // Add a document-level click listener to hide actions when clicking outside
    document.addEventListener('click', (e) => {
        // If the click is not on an actionable cell, hide all actions
        if (!e.target.closest('td:first-child') && !e.target.closest('.shift-cell')) {
            document.querySelectorAll('#schedule tr.actions-visible, #schedule .shift-cell.actions-visible').forEach(el => {
                el.classList.remove('actions-visible');
            });
        }
    });

    console.log('Setting up event listeners...');

    // Helper to safely add event listeners
    const addListener = (id, event, handler) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        } else if (id !== 'prevWeek' && id !== 'nextWeek' && id !== 'currentWeek' && id !== 'todayBtn') {
            // Only log error for non-date navigation elements
            console.log(`Element with ID '${id}' not found.`);
        }
    };

    // Main controls
    addListener('addEmployee', 'click', showAddEmployeeModal);
    addListener('generateSchedule', 'click', confirmGenerateSchedule);
    addListener('printSchedule', 'click', printSchedule);
    addListener('exportExcel', 'click', exportToExcel);
    addListener('exportPDF', 'click', exportToPDF);
    addListener('exportJPG', 'click', exportToJPG);
    addListener('confirmGenerateBtn', 'click', generateSchedule);

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

    // Initialize the modal if not already done
    let employeeModal = bootstrap.Modal.getInstance(modalElement);
    if (!employeeModal) {
        employeeModal = new bootstrap.Modal(modalElement);
    }

    // Clear previous input
    document.getElementById('employeeName').value = '';
    document.getElementById('employeeRole').selectedIndex = 0;

    // Remove any existing click handlers from the save button
    const saveButton = document.getElementById('saveEmployee');
    const newSaveButton = saveButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);

    // Add new click handler
    newSaveButton.onclick = function() {
        const name = document.getElementById('employeeName').value.trim();
        const role = document.getElementById('employeeRole').value;

        if (name) {
            const newEmployee = createEmployee(name, role);
            console.log('New employee created:', newEmployee);
            renderSchedule();
            
            // Close the modal
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
            
            // Show success message
            showTemporaryMessage(`Employee ${name} added successfully!`);
        } else {
            showTemporaryMessage('Please enter a name for the employee.', 'warning');
            document.getElementById('employeeName').focus();
        }
    };

    // Show the modal
    employeeModal.show();
    
    // Focus the name field when modal is shown
    modalElement.addEventListener('shown.bs.modal', function() {
        document.getElementById('employeeName').focus();
    });
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
            showTemporaryMessage('Employee name cannot be empty.', 'warning');
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
function confirmGenerateSchedule() {
    const modal = new bootstrap.Modal(document.getElementById('confirmGenerateModal'));
    modal.show();
}

function generateSchedule() {
    const shifts = Object.keys(state.shifts).filter(shift => shift !== 'OFF');
    const days = state.days; // Already an array of day names
    
    state.employees.forEach(employee => {
        // Reset all days to working days first
        days.forEach(day => {
            employee.shifts[day] = '8--5'; // Default shift
        });

        // Assign one random day off
        const offDay = days[Math.floor(Math.random() * days.length)];
        employee.shifts[offDay] = 'OFF';

        // Assign shifts to working days
        const workingDays = days.filter(day => day !== offDay);
        workingDays.forEach((day, index) => {
            // Distribute shifts evenly
            const shiftIndex = index % shifts.length;
            employee.shifts[day] = shifts[shiftIndex];
        });
    });

    // Ensure coverage - make sure at least one employee is working each shift each day
    days.forEach(day => {
        const workingEmployees = state.employees.filter(emp => emp.shifts[day] !== 'OFF');
        if (workingEmployees.length === 0) {
            // If no one is working on this day, assign someone
            const randomEmployee = state.employees[Math.floor(Math.random() * state.employees.length)];
            randomEmployee.shifts[day] = '8--5'; // Assign default shift
        }
    });

    saveToLocalStorage();
    renderSchedule();
    showTemporaryMessage('New schedule has been generated!', 'success');
    
    // Hide the confirmation modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmGenerateModal'));
    if (modal) {
        modal.hide();
    }
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
        showTemporaryMessage('No schedule table found to export.', 'warning');
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
        showTemporaryMessage('No schedule found to export.', 'warning');
        return;
    }

    // Add export class to body
    document.body.classList.add('export-mode');

    window.scrollTo(0, 0);

    html2canvas(scheduleElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        windowWidth: 1400 // Set a virtual width for rendering
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `PizzaHut_Schedule_${formatDate(state.currentWeekStart)}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
    }).catch(err => {
        console.error('Error exporting to JPG:', err);
        showTemporaryMessage('An error occurred while exporting the schedule as a JPG image.', 'error');
    }).finally(() => {
        // Always remove the export class
        document.body.classList.remove('export-mode');
    });
}

function showEditShiftModal(employeeId, day) {
    const employee = state.employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const currentShift = employee.shifts[day] || 'OFF';
    const modal = document.getElementById('editShiftModal');
    
    // Set modal values
    document.getElementById('editShiftEmployeeId').value = employeeId;
    document.getElementById('editShiftDay').value = day;
    document.getElementById('editShiftEmployeeName').textContent = employee.name;
    document.getElementById('editShiftDayDisplay').textContent = day;
    document.getElementById('shiftType').value = currentShift;
    
    // Check for existing off days and show warning if needed
    const currentOffDays = Object.values(employee.shifts).filter(shift => shift === 'OFF').length;
    const isCurrentDayOff = currentShift === 'OFF';
    const offDayWarning = document.getElementById('offDayWarning');
    
    if (currentOffDays >= 1 && !isCurrentDayOff) {
        offDayWarning.style.display = 'block';
    } else {
        offDayWarning.style.display = 'none';
    }
    
    // Initialize the modal
    const bsModal = new bootstrap.Modal(modal);
    
    // Handle modal events for better accessibility
    const handleShown = () => {
        // Focus the first focusable element in the modal
        const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
    };
    
    const handleHidden = () => {
        // Clean up event listeners
        modal.removeEventListener('shown.bs.modal', handleShown);
        modal.removeEventListener('hidden.bs.modal', handleHidden);
        
        // Restore focus to the button that opened the modal
        const triggerButton = document.querySelector(`[data-bs-toggle="modal"][data-bs-target="#editShiftModal"]`);
        if (triggerButton) triggerButton.focus();
    };
    
    // Add event listeners
    modal.addEventListener('shown.bs.modal', handleShown);
    modal.addEventListener('hidden.bs.modal', handleHidden);
    
    // Show the modal
    bsModal.show();
    
    // Return the modal instance for external use if needed
    return bsModal;
}

// Save shift changes from the modal
function saveShiftChanges() {
    const modalElement = document.getElementById('editShiftModal');
    const employeeId = parseInt(document.getElementById('editShiftEmployeeId').value);
    const day = document.getElementById('editShiftDay').value;
    const newShift = document.getElementById('shiftType').value;
    
    const employee = state.employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    // Update the shift for the selected day
    employee.shifts[day] = newShift;
    
    // Update the updatedAt timestamp
    employee.updatedAt = new Date().toISOString();
    
    saveToLocalStorage();
    renderSchedule();
    
    // Hide the modal using the Bootstrap 5 method
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
    } else {
        // Fallback in case the modal instance isn't available
        const bsModal = new bootstrap.Modal(modalElement);
        bsModal.hide();
    }
}

// Clear shift (set to OFF)
function clearShift() {
    document.getElementById('shiftType').value = 'OFF';
}

// Setup event listeners for the shift edit modal
function setupShiftModalListeners() {
    // Save button
    document.getElementById('saveShiftBtn').addEventListener('click', saveShiftChanges);
    
    // Clear button
    document.getElementById('clearShiftBtn').addEventListener('click', clearShift);
    
    // Handle enter key in the modal
    document.getElementById('editShiftModal').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveShiftChanges();
        }
    });
}

// Add drag and drop functionality
function setupDragAndDrop() {
    let draggedCell = null;
    let draggedShift = null;
    let draggedEmployeeId = null;
    let isDragging = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchTimer = null;
    const LONG_PRESS_DURATION = 300; // ms to wait before considering it a long press
    const TOUCH_MOVE_THRESHOLD = 10; // Minimum pixels to move before considering it a drag

    function startDrag(cell, x, y, isTouch = false) {
        if (!cell || cell.classList.contains('table-secondary') || !cell.textContent.trim() || isDragging) {
            return false;
        }

        // For touch events, we'll use a timer to determine if it's a long press
        if (isTouch) {
            touchStartTime = Date.now();
            touchStartX = x;
            touchStartY = y;
            touchTimer = setTimeout(() => {
                // This is a long press - start drag
                isDragging = true;
                draggedCell = cell;
                draggedEmployeeId = cell.getAttribute('data-employee-id');
                draggedShift = cell.textContent.trim();
                
                // Add dragging class for visual feedback
                cell.classList.add('dragging');
                document.body.classList.add('dragging-active');
                
                // Prevent text selection
                document.body.style.webkitUserSelect = 'none';
                document.body.style.userSelect = 'none';
            }, LONG_PRESS_DURATION);
            return false;
        } else {
            // For mouse events, start drag immediately
            isDragging = true;
            draggedCell = cell;
            draggedEmployeeId = cell.getAttribute('data-employee-id');
            draggedShift = cell.textContent.trim();
            
            // Add dragging class for visual feedback
            cell.classList.add('dragging');
            document.body.classList.add('dragging-active');
            
            return true;
        }
    }

    function cancelDrag() {
        if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
        }
        resetDragState();
    }

    function handleDragMove(x, y) {
        if (!isDragging) return;
        
        // For touch events, we need to get the element at the touch point
        const touchPoint = document.elementFromPoint(x, y);
        const targetCell = touchPoint ? touchPoint.closest('td[data-employee-id][data-day]') : null;
        
        if (!targetCell || targetCell === draggedCell) {
            // Remove hover effect from all cells if not over a valid target
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            return;
        }
        
        // Remove hover effect from all cells first
        document.querySelectorAll('.drag-over').forEach(el => {
            if (el !== targetCell) el.classList.remove('drag-over');
        });
        
        // Add hover effect to current target
        targetCell.classList.add('drag-over');
    }

    function handleDragEnd(e, isTouch = false) {
        if (!isDragging) return;
        
        // Clean up
        document.querySelectorAll('.drag-over, .dragging').forEach(el => {
            el.classList.remove('drag-over', 'dragging');
        });
        document.body.classList.remove('dragging-active');
        
        // For touch events, we need to get the element at the touch point
        const endX = isTouch ? e.changedTouches[0].clientX : e.clientX;
        const endY = isTouch ? e.changedTouches[0].clientY : e.clientY;
        const touchPoint = document.elementFromPoint(endX, endY);
        const targetCell = touchPoint ? touchPoint.closest('td[data-employee-id][data-day]') : null;
        
        if (!targetCell || targetCell === draggedCell) {
            resetDragState();
            return;
        }
        
        const targetEmployeeId = targetCell.getAttribute('data-employee-id');
        const targetDay = targetCell.getAttribute('data-day');
        const sourceDay = draggedCell.getAttribute('data-day');
        
        // Get the employees
        const sourceEmployee = state.employees.find(emp => emp.id === parseInt(draggedEmployeeId));
        const targetEmployee = state.employees.find(emp => emp.id === parseInt(targetEmployeeId));
        
        if (!sourceEmployee || !targetEmployee) {
            resetDragState();
            return;
        }
        
        // Get the shifts
        const sourceShift = sourceEmployee.shifts[sourceDay];
        const targetShift = targetEmployee.shifts[targetDay];
        
        // Validate the move
        if (!validateShiftMove(sourceEmployee, targetEmployee, sourceShift, targetShift, sourceDay, targetDay)) {
            resetDragState();
            return;
        }
        
        // Perform the swap
        sourceEmployee.shifts[sourceDay] = targetShift;
        targetEmployee.shifts[targetDay] = sourceShift;
        
        // Update timestamps
        const now = new Date().toISOString();
        sourceEmployee.updatedAt = now;
        targetEmployee.updatedAt = now;
        
        // Save and refresh
        saveToLocalStorage();
        renderSchedule();
        
        resetDragState();
    }
    
    function resetDragState() {
        isDragging = false;
        draggedCell = null;
        draggedEmployeeId = null;
        draggedShift = null;
        document.body.style.cursor = '';
    }

    // Mouse events
    document.addEventListener('mousedown', (e) => {
        const cell = e.target.closest('td[data-employee-id][data-day]');
        if (startDrag(cell, e.clientX, e.clientY)) {
            e.preventDefault();
        }
    });

    // Touch events
    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('td[data-employee-id][data-day]');
        if (cell && !cell.classList.contains('table-secondary') && cell.textContent.trim()) {
            startDrag(cell, touch.clientX, touch.clientY, true);
        }
    }, { passive: true });

    // Mouse move handler
    document.addEventListener('mousemove', (e) => {
        handleDragMove(e.clientX, e.clientY);
    });

    // Touch move handler
    document.addEventListener('touchmove', (e) => {
        if (!isDragging && touchTimer) {
            const touch = e.touches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            
            if (Math.sqrt(dx * dx + dy * dy) > TOUCH_MOVE_THRESHOLD) {
                // Moved too much, cancel the long press
                cancelDrag();
            }
        } else if (isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            handleDragMove(touch.clientX, touch.clientY);
        }
    }, { passive: false });

    // Mouse up handler
    document.addEventListener('mouseup', (e) => {
        handleDragEnd(e, false);
    });

    // Touch end handler
    document.addEventListener('touchend', (e) => {
        const wasDragging = isDragging;
        
        // If we were dragging, handle the drag end
        if (wasDragging) {
            handleDragEnd(e, true);
        } 
        // If we have a timer running and it hasn't been long enough for a long press
        else if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
            
            // This was a tap - handle as a click for editing
            const touch = e.changedTouches[0];
            const cell = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('td[data-employee-id][data-day]');
            
            if (cell && !cell.classList.contains('table-secondary') && cell.textContent.trim()) {
                const employeeId = cell.getAttribute('data-employee-id');
                const day = cell.getAttribute('data-day');
                showEditShiftModal(employeeId, day);
            }
        }
    }, { passive: true });

    // Handle touch cancel
    document.addEventListener('touchcancel', () => {
        if (isDragging || touchTimer) {
            cancelDrag();
            document.querySelectorAll('.drag-over, .dragging').forEach(el => {
                el.classList.remove('drag-over', 'dragging');
            });
            document.body.classList.remove('dragging-active');
        }
    });

    // Reset drag state
    function resetDragState() {
        isDragging = false;
        draggedCell = null;
        draggedEmployeeId = null;
        draggedShift = null;
        touchTimer = null;
        document.body.style.cursor = '';
        document.body.style.webkitUserSelect = '';
        document.body.style.userSelect = '';
    }

    // Validate if the shift move is allowed
    function validateShiftMove(sourceEmployee, targetEmployee, sourceShift, targetShift, sourceDay, targetDay) {
        // All moves are allowed - no restrictions on number of OFF days
        return true;
    }
        return true;
    }

    // Show temporary message to user with optional type (success, error, info)
    function showTemporaryMessage(message, type = 'info') {
        // Log the message with timestamp and type
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
        
        // Create message element
        const msg = document.createElement('div');
        msg.className = `temp-message temp-message-${type}`;
        
        // Add icon based on message type
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<i class="bi bi-check-circle-fill"></i> ';
                break;
            case 'error':
                icon = '<i class="bi bi-exclamation-triangle-fill"></i> ';
                break;
            case 'info':
            default:
                icon = '<i class="bi bi-info-circle-fill"></i> ';
        }
        
        msg.innerHTML = `${icon}${message}`;
        
        // Add to DOM and animate in
        document.body.appendChild(msg);
        setTimeout(() => {
            msg.classList.add('show');
            setTimeout(() => {
                msg.classList.remove('show');
                setTimeout(() => {
                    if (msg.parentNode) {
                        document.body.removeChild(msg);
                    }
                }, 300);
            }, 3000); // Show for 3 seconds
        }, 10);
        
        // Log to console with styling
        const style = `color: ${type === 'success' ? '#198754' : type === 'error' ? '#dc3545' : '#0d6efd'}; font-weight: bold`;
        console.log(`%c${type.toUpperCase()}: ${message}`, style);
    }

// Initialize drag and drop when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupDragAndDrop();
    setupShiftModalListeners();
});

// CSS styles are now defined at the top of the file
