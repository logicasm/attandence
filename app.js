// =================================================================================
// DATABASE (SIMULATED WITH LOCALSTORAGE)
// =================================================================================
let db = {
    employees: [],
    attendance: [],
    fundTransactions: [],
    kharchi: [],
};

function saveDatabase() {
    localStorage.setItem('employeeManagerData', JSON.stringify(db));
}

function loadDatabase() {
    const data = localStorage.getItem('employeeManagerData');
    if (data) {
        db = JSON.parse(data);
    } else {
        // Initialize with some default data if nothing is in localStorage
        db = {
            employees: [
                { id: 'SHA1234', name: "Aarav Sharma", designation: "Site Supervisor", rate: 800, mobile: "9876543210", aadhar: "123456789012", joiningDate: "2025-01-15", account: "1234567890", ifsc: "ABCD0123456", profileImageSrc: "https://placehold.co/128x128/e2e8f0/718096?text=AS" },
                { id: 'KHA5678', name: "Boby Khan", designation: "Mason", rate: 750, mobile: "9876543211", aadhar: "123456789013", joiningDate: "2025-02-20", account: "0987654321", ifsc: "EFGH0123456", profileImageSrc: "https://placehold.co/128x128/e2e8f0/718096?text=BK" },
            ],
            attendance: [],
            fundTransactions: [
                { id: 1, type: 'credit', date: '2025-06-01', amount: 50000, description: 'Fund from Company', category: 'Credit' },
            ],
            kharchi: [],
        };
        saveDatabase();
    }
}


// =================================================================================
// PAGE INITIALIZATION ROUTER
// =================================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadDatabase();
    const page = window.location.pathname.split('/').pop();

    if (page === 'index.html' || page === '') {
        initializeDashboardPage();
    } else if (page === 'add-employee.html') {
        initializeAddEmployeePage();
    } else if (page === 'attendance.html') {
        initializeAttendancePage();
    } else if (page === 'fund-management.html') {
        initializeFundManagementPage();
    } else if (page === 'kharchi.html') {
        initializeKharchiPage();
    } else if (page === 'paysheet.html') {
        initializePaysheetPage();
    }
});


// =================================================================================
// DASHBOARD LOGIC
// =================================================================================
function initializeDashboardPage() {
    const today = new Date();
    const currentMonthStr = today.toISOString().slice(0, 7);
    
    document.getElementById('stat-total-employees').textContent = db.employees.length;
    
    const currentFund = db.fundTransactions.reduce((acc, t) => acc + (t.type === 'credit' ? t.amount : -t.amount), 0);
    document.getElementById('stat-current-fund').textContent = `₹${currentFund.toLocaleString('en-IN')}`;
    
    const fundUsedThisMonth = db.fundTransactions.filter(t => t.type === 'debit' && t.date.startsWith(currentMonthStr)).reduce((sum, t) => sum + t.amount, 0);
    document.getElementById('stat-fund-used').textContent = `₹${fundUsedThisMonth.toLocaleString('en-IN')}`;
    
    const todayStr = today.toISOString().split('T')[0];
    const todayAttendanceCount = db.attendance.filter(r => r.date === todayStr && r.status === 'Present').length;
    document.getElementById('stat-today-attendance').textContent = todayAttendanceCount;
    
    const totalAttendanceThisMonth = db.attendance.filter(r => r.date.startsWith(currentMonthStr)).reduce((sum, r) => sum + r.totalP, 0);
    document.getElementById('stat-total-attendance').textContent = totalAttendanceThisMonth.toFixed(2);
    
    let totalWages = 0;
    db.employees.forEach(emp => {
        const empAttendance = db.attendance.filter(r => r.employeeId === emp.id && r.date.startsWith(currentMonthStr));
        const totalAtd = empAttendance.reduce((sum, r) => sum + r.totalP, 0);
        totalWages += totalAtd * (emp.rate || 0);
    });
    
    const kharchiAndAdvance = db.kharchi.filter(t => t.date.startsWith(currentMonthStr)).reduce((sum, t) => sum + t.amount, 0);
    const netPayment = totalWages - kharchiAndAdvance;
    document.getElementById('stat-net-payment').textContent = `₹${netPayment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}


// =================================================================================
// ADD EMPLOYEE PAGE LOGIC
// =================================================================================
function initializeAddEmployeePage() {
    const employeeForm = document.getElementById('add-employee-form');
    if (!employeeForm) return;

    const successMessage = document.getElementById('success-message');
    const employeeIdDisplay = document.getElementById('employee-id-display');
    const nameInput = document.getElementById('name');
    const aadharInput = document.getElementById('aadhar');
    const joiningDateInput = document.getElementById('joining-date');
    const employeeTableBody = document.getElementById('employee-table-body');
    const noEmployeesRow = document.getElementById('no-employees-row');
    
    // Image/Camera elements
    const imageUploadInput = document.getElementById('image-upload');
    const uploadButton = document.getElementById('upload-button');
    const cameraButton = document.getElementById('camera-button');
    const imagePreview = document.getElementById('profile-image-preview');
    const videoContainer = document.getElementById('video-container');
    const videoFeed = document.getElementById('video-feed');
    const videoStatus = document.getElementById('video-status');
    const captureButton = document.getElementById('capture-button');
    const cancelCameraButton = document.getElementById('cancel-camera');
    const canvas = document.getElementById('canvas');
    let videoStream = null;

    // Modal elements
    const errorModal = document.getElementById('error-modal');
    const errorMessage = document.getElementById('error-message');
    const closeErrorModalButton = document.getElementById('close-error-modal');
    const imageViewModal = document.getElementById('image-view-modal');
    const fullSizeImage = document.getElementById('full-size-image');
    const closeImageModalButton = document.getElementById('close-image-modal');

    // Edit Modal Elements
    const editModal = document.getElementById('edit-employee-modal');
    const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
    const editForm = document.getElementById('edit-employee-form');

    function showErrorModal(message) {
        errorMessage.textContent = message;
        errorModal.classList.remove('hidden');
    }

    function updateEmployeeId() {
        const name = nameInput.value.trim().toUpperCase().replace(/[^A-Z]/g, '');
        const aadhar = aadharInput.value.trim().replace(/\D/g, '');

        if (name.length >= 3 && aadhar.length >= 4) {
            const namePart = name.substring(0, 3);
            const aadharPart = aadhar.substring(aadhar.length - 4);
            employeeIdDisplay.textContent = `${namePart}${aadharPart}`;
            employeeIdDisplay.classList.remove('text-gray-600');
            employeeIdDisplay.classList.add('text-green-700');
        } else {
            employeeIdDisplay.textContent = 'Awaiting name (3+) and Aadhar (4+)...';
            employeeIdDisplay.classList.add('text-gray-600');
            employeeIdDisplay.classList.remove('text-green-700');
        }
    }
    
    function addEmployeeToTable(employee) {
        if (noEmployeesRow) {
            noEmployeesRow.style.display = 'none';
        }

        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.setAttribute('data-id', employee.id);
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${employee.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${employee.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${employee.designation}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹${employee.dailyRate}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${employee.aadhar}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${employee.mobile}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${employee.account || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${employee.joiningDate}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="edit-btn text-indigo-600 hover:text-indigo-900" data-id="${employee.id}">Edit</button>
                <button class="delete-btn text-red-600 hover:text-red-900 ml-4" data-id="${employee.id}">Delete</button>
            </td>
        `;
        
        employeeTableBody.appendChild(row);
    }

    // Camera and Image Upload Logic
    uploadButton.addEventListener('click', () => imageUploadInput.click());

    imageUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => { imagePreview.src = e.target.result; };
            reader.readAsDataURL(file);
        }
    });

    cameraButton.addEventListener('click', async () => {
        videoStatus.textContent = 'Requesting camera access...';
        videoContainer.classList.remove('hidden');

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                videoFeed.srcObject = videoStream;
                videoFeed.onloadedmetadata = () => {
                    videoStatus.classList.add('hidden');
                };
            } catch (err) {
                closeCamera();
                let message = "Could not access the camera.";
                if (err.name === "NotAllowedError") {
                    message = "Camera access was denied. Please allow camera access in your browser settings.";
                } else if (err.name === "NotFoundError") {
                    message = "No camera was found on this device.";
                } else {
                     message = `An error occurred: ${err.name}. Please ensure you are using a secure (https) connection.`;
                }
                showErrorModal(message);
            }
        } else {
            closeCamera();
            showErrorModal("Your browser does not support camera access.");
        }
    });

    captureButton.addEventListener('click', () => {
        if (!videoStream || videoFeed.readyState < 2 || videoFeed.videoWidth === 0) {
            showErrorModal("Camera is not ready. Please wait a moment and try again.");
            return;
        }
        canvas.width = videoFeed.videoWidth;
        canvas.height = videoFeed.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);
        
        imagePreview.src = canvas.toDataURL('image/png');
        closeCamera();
    });

    function closeCamera() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
        }
        videoFeed.srcObject = null;
        videoStream = null;
        videoContainer.classList.add('hidden');
        videoStatus.classList.remove('hidden');
    }
    cancelCameraButton.addEventListener('click', closeCamera);

    // Event Listeners
    nameInput.addEventListener('input', updateEmployeeId);
    aadharInput.addEventListener('input', updateEmployeeId);
    
    closeErrorModalButton.addEventListener('click', () => {
        errorModal.classList.add('hidden');
    });

    imagePreview.addEventListener('click', () => {
        if (imagePreview.src.includes('placehold.co')) {
            return;
        }
        fullSizeImage.src = imagePreview.src;
        imageViewModal.classList.remove('hidden');
    });

    function closeImageViewer() {
        imageViewModal.classList.add('hidden');
    }
    closeImageModalButton.addEventListener('click', closeImageViewer);
    imageViewModal.addEventListener('click', (e) => {
        if (e.target === imageViewModal) {
            closeImageViewer();
        }
    });

    employeeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const generatedId = employeeIdDisplay.textContent;
        if (generatedId.includes('Awaiting')) {
            showErrorModal('Please provide a valid name and Aadhar number to generate an ID.');
            return;
        }
        const formData = new FormData(employeeForm);
        const newEmployee = {
            id: generatedId,
            name: formData.get('name'),
            designation: formData.get('designation'),
            dailyRate: parseFloat(formData.get('dailyRate')),
            mobile: formData.get('mobile'),
            aadhar: formData.get('aadhar'),
            joiningDate: formData.get('joiningDate'),
            account: formData.get('account'),
            ifsc: formData.get('ifsc'),
            profileImageSrc: imagePreview.src 
        };
        
        db.employees.push(newEmployee);
        saveDatabase();
        
        addEmployeeToTable(newEmployee);
        
        successMessage.textContent = `Successfully added ${newEmployee.name} with Employee ID: ${newEmployee.id}.`;
        successMessage.classList.remove('hidden');
        
        employeeForm.reset();
        imagePreview.src = 'https://placehold.co/128x128/e2e8f0/718096?text=Photo';
        updateEmployeeId();
        
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 5000);
    });

    // Edit/Delete Logic
    employeeTableBody.addEventListener('click', (e) => {
        const employeeId = e.target.dataset.id;
        if (!employeeId) return;

        if (e.target.classList.contains('edit-btn')) {
            const employee = db.employees.find(emp => emp.id === employeeId);
            if (employee) {
                document.getElementById('edit-employee-id').value = employee.id;
                document.getElementById('edit-name').value = employee.name;
                document.getElementById('edit-designation').value = employee.designation;
                document.getElementById('edit-daily-rate').value = employee.dailyRate;
                document.getElementById('edit-mobile').value = employee.mobile;
                document.getElementById('edit-aadhar').value = employee.aadhar;
                document.getElementById('edit-account').value = employee.account || '';
                document.getElementById('edit-ifsc').value = employee.ifsc || '';
                editModal.classList.remove('hidden');
            }
        }

        if (e.target.classList.contains('delete-btn')) {
            if (confirm(`Are you sure you want to delete employee ${employeeId}? This action cannot be undone.`)) {
                db.employees = db.employees.filter(emp => emp.id !== employeeId);
                // Also remove related data
                db.attendance = db.attendance.filter(rec => rec.employeeId !== employeeId);
                db.kharchi = db.kharchi.filter(rec => rec.employeeId !== employeeId);
                saveDatabase();
                renderEmployeeTable(); // Re-render the entire table
            }
        }
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const employeeId = document.getElementById('edit-employee-id').value;
        const employeeIndex = db.employees.findIndex(emp => emp.id === employeeId);

        if (employeeIndex > -1) {
            db.employees[employeeIndex].name = document.getElementById('edit-name').value;
            db.employees[employeeIndex].designation = document.getElementById('edit-designation').value;
            db.employees[employeeIndex].dailyRate = parseFloat(document.getElementById('edit-daily-rate').value);
            db.employees[employeeIndex].mobile = document.getElementById('edit-mobile').value;
            db.employees[employeeIndex].account = document.getElementById('edit-account').value;
            db.employees[employeeIndex].ifsc = document.getElementById('edit-ifsc').value;
            saveDatabase();
            renderEmployeeTable();
            editModal.classList.add('hidden');
        }
    });

    closeEditModalBtn.addEventListener('click', () => {
        editModal.classList.add('hidden');
    });
    
    joiningDateInput.valueAsDate = new Date();

    // Load existing employees into table
    renderEmployeeTable();
}

// =================================================================================
// ATTENDANCE PAGE LOGIC
// =================================================================================
function initializeAttendancePage() {
    const markingDateInput = document.getElementById('marking-date');
    if (!markingDateInput) return;

    const searchInput = document.getElementById('employee-search');
    const resultsContainer = document.getElementById('employee-results');
    const actionButtons = document.getElementById('action-buttons');
    const employeeInfo = document.getElementById('employee-info');
    const employeeNameDisplay = document.getElementById('employee-name-display');
    const employeeIdDisplay = document.getElementById('employee-id-display');
    const alreadyMarkedMsg = document.getElementById('already-marked-msg');
    const successMessage = document.getElementById('success-message');
    const markPresentBtn = document.getElementById('mark-present-btn');
    const markAbsentBtn = document.getElementById('mark-absent-btn');
    const logDateFilter = document.getElementById('log-date-filter');
    const tableBody = document.getElementById('attendance-table-body');
    const noAttendanceRow = document.getElementById('no-attendance-row');
    const summaryContainer = document.getElementById('summary-container');

    // Modal elements
    const editModal = document.getElementById('edit-modal');
    const modalEmployeeInfo = document.getElementById('edit-modal-employee-info');
    const otHoursInput = document.getElementById('ot-hours');
    const totalPDisplay = document.getElementById('total-p-display');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const saveOtBtn = document.getElementById('save-ot-btn');

    let selectedEmployee = null;
    let currentlyEditingRecord = null;

    function updateDailySummary(dateStr) {
        const records = db.attendance.filter(r => r.date === dateStr);
        const totalEmployees = db.employees.length;
        const presentCount = records.filter(r => r.status === 'Present').length;
        const absentCount = records.filter(r => r.status === 'Absent').length;
        const totalOtHours = records.reduce((sum, r) => sum + r.otHours, 0);
        const totalPresence = records.reduce((sum, r) => sum + r.totalP, 0);
        const attendanceRate = totalEmployees > 0 ? ((presentCount / totalEmployees) * 100).toFixed(1) : 0;

        summaryContainer.innerHTML = `
            <div class="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p class="text-sm font-medium text-green-700">Present Today</p>
                <p class="text-2xl font-bold text-green-800">${presentCount}</p>
            </div>
            <div class="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p class="text-sm font-medium text-red-700">Absent Today</p>
                <p class="text-2xl font-bold text-red-800">${absentCount}</p>
            </div>
            <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p class="text-sm font-medium text-blue-700">Attendance Rate</p>
                <p class="text-2xl font-bold text-blue-800">${attendanceRate}%</p>
            </div>
            <div class="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <p class="text-sm font-medium text-purple-700">Total OT Hours</p>
                <p class="text-2xl font-bold text-purple-800">${totalOtHours.toFixed(1)}</p>
            </div>
            <div class="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <p class="text-sm font-medium text-orange-700">Total Presence</p>
                <p class="text-2xl font-bold text-orange-800">${totalPresence.toFixed(2)}</p>
            </div>
            <div class="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <p class="text-sm font-medium text-gray-700">Total Employees</p>
                <p class="text-2xl font-bold text-gray-800">${totalEmployees}</p>
            </div>
        `;
    }

    function renderLogForDate(dateStr) {
        logDateFilter.value = dateStr;
        tableBody.innerHTML = '';
        const records = db.attendance.filter(r => r.date === dateStr);

        if (records.length === 0) {
            tableBody.appendChild(noAttendanceRow);
            return;
        }

        records.forEach(record => {
            const employee = db.employees.find(e => e.id === record.employeeId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${employee.name}</div>
                    <div class="text-sm text-gray-500">${employee.id}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${record.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.otHours}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">${record.totalP.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="edit-btn text-indigo-600 hover:text-indigo-900" data-id="${record.id}">Edit</button>
                    <button class="delete-btn text-red-600 hover:text-red-900 ml-4" data-id="${record.id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Update daily summary when log is rendered
        updateDailySummary(dateStr);
    }

    function selectEmployee(employee) {
        selectedEmployee = employee;
        searchInput.value = `${employee.name} (${employee.id})`;
        resultsContainer.classList.add('hidden');
        actionButtons.classList.remove('hidden');
        employeeInfo.classList.remove('hidden');
        employeeNameDisplay.textContent = employee.name;
        employeeIdDisplay.textContent = employee.id;

        const date = markingDateInput.value;
        const existingRecord = db.attendance.find(r => r.employeeId === employee.id && r.date === date);
        if (existingRecord) {
            alreadyMarkedMsg.textContent = `Already marked as ${existingRecord.status}. You can edit in the log.`;
            markPresentBtn.disabled = true;
            markAbsentBtn.disabled = true;
        } else {
            alreadyMarkedMsg.textContent = '';
            markPresentBtn.disabled = false;
            markAbsentBtn.disabled = false;
        }
    }

    function markAttendance(status) {
        if (!selectedEmployee) return;
        const date = markingDateInput.value;
        const newRecord = {
            id: Date.now(),
            employeeId: selectedEmployee.id,
            date: date,
            status: status,
            otHours: 0,
            totalP: status === 'Present' ? 1.0 : 0
        };
        db.attendance.push(newRecord);
        saveDatabase();
        
        successMessage.textContent = `${selectedEmployee.name} marked as ${status}.`;
        successMessage.classList.remove('hidden');
        setTimeout(() => successMessage.classList.add('hidden'), 3000);

        resetSelection();
        if (date === logDateFilter.value) {
            renderLogForDate(date);
        }
        // Update summary for the marking date
        updateDailySummary(date);
    }

    function resetSelection() {
        selectedEmployee = null;
        searchInput.value = '';
        actionButtons.classList.add('hidden');
        employeeInfo.classList.add('hidden');
    }

    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        if (term.length > 0) {
            const filtered = db.employees.filter(e => e.name.toLowerCase().includes(term) || e.id.toLowerCase().includes(term));
            resultsContainer.innerHTML = '';
            filtered.forEach(emp => {
                const div = document.createElement('div');
                div.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
                div.textContent = `${emp.name} (${emp.id})`;
                div.onclick = () => selectEmployee(emp);
                resultsContainer.appendChild(div);
            });
            resultsContainer.classList.remove('hidden');
        } else {
            resultsContainer.classList.add('hidden');
        }
    });

    markPresentBtn.onclick = () => markAttendance('Present');
    markAbsentBtn.onclick = () => markAttendance('Absent');

    logDateFilter.addEventListener('change', (e) => renderLogForDate(e.target.value));

    tableBody.addEventListener('click', (e) => {
        const recordId = parseInt(e.target.dataset.id);
        if (e.target.classList.contains('edit-btn')) {
            currentlyEditingRecord = db.attendance.find(r => r.id === recordId);
            const employee = db.employees.find(emp => emp.id === currentlyEditingRecord.employeeId);
            modalEmployeeInfo.textContent = `Editing for: ${employee.name}`;
            otHoursInput.value = currentlyEditingRecord.otHours;
            totalPDisplay.textContent = currentlyEditingRecord.totalP.toFixed(2);
            editModal.classList.remove('hidden');
        }
        if (e.target.classList.contains('delete-btn')) {
            if(confirm('Are you sure you want to delete this record?')) {
                db.attendance = db.attendance.filter(r => r.id !== recordId);
                saveDatabase();
                renderLogForDate(logDateFilter.value);
            }
        }
    });

    otHoursInput.addEventListener('input', () => {
        const hours = parseFloat(otHoursInput.value) || 0;
        totalPDisplay.textContent = (1 + (hours / 8)).toFixed(2);
    });

    saveOtBtn.onclick = () => {
        const hours = parseFloat(otHoursInput.value) || 0;
        currentlyEditingRecord.otHours = hours;
        currentlyEditingRecord.totalP = 1 + (hours / 8);
        saveDatabase();
        editModal.classList.add('hidden');
        renderLogForDate(logDateFilter.value);
    };

    cancelEditBtn.onclick = () => editModal.classList.add('hidden');

    const today = new Date().toISOString().split('T')[0];
    markingDateInput.value = today;
    logDateFilter.value = today;
    renderLogForDate(today);
}

// =================================================================================
// FUND MANAGEMENT PAGE LOGIC
// =================================================================================
function initializeFundManagementPage() {
    const creditForm = document.getElementById('credit-form');
    if(!creditForm) return;

    const debitForm = document.getElementById('debit-form');
    const successMessage = document.getElementById('success-message');
    const tableBody = document.getElementById('transaction-table-body');
    const noTransactionsRow = document.getElementById('no-transactions-row');
    const currentBalanceDisplay = document.getElementById('current-balance');
    const openReportModalBtn = document.getElementById('open-report-modal-btn');
    const reportModal = document.getElementById('report-modal');
    const closeReportModalBtn = document.getElementById('close-report-modal-btn');
    const runReportBtn = document.getElementById('run-report-btn');
    const reportContent = document.getElementById('report-content');
    
    function updateSummaryAndTable() {
        let runningBalance = 0;
        
        const sortedTransactions = db.fundTransactions.sort((a,b) => new Date(a.date) - new Date(b.date) || a.id - b.id);
        
        tableBody.innerHTML = '';
        if (sortedTransactions.length === 0) {
            tableBody.appendChild(noTransactionsRow);
            currentBalanceDisplay.textContent = '₹0';
            return;
        }

        sortedTransactions.forEach(t => {
            const row = document.createElement('tr');
            const creditAmount = t.type === 'credit' ? `₹${t.amount.toLocaleString('en-IN')}` : '-';
            const debitAmount = t.type === 'debit' ? `₹${t.amount.toLocaleString('en-IN')}` : '-';
            
            if (t.type === 'credit') { runningBalance += t.amount; } 
            else { runningBalance -= t.amount; }

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${t.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${t.description}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold text-right">${creditAmount}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold text-right">${debitAmount}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 text-right">₹${runningBalance.toLocaleString('en-IN')}</td>
            `;
            tableBody.appendChild(row);
        });
        
        currentBalanceDisplay.textContent = `₹${runningBalance.toLocaleString('en-IN')}`;
    }

    function generateReport() {
        const startDate = document.getElementById('report-start-date').value;
        const endDate = document.getElementById('report-end-date').value;

        if (!startDate || !endDate) {
            alert('Please select both a start and end date.');
            return;
        }

        const filtered = db.fundTransactions.filter(t => t.date >= startDate && t.date <= endDate);
        
        const grouped = filtered.reduce((acc, t) => {
            const key = t.type === 'credit' ? t.description : t.category;
            if (!acc[key]) {
                acc[key] = { total: 0, type: t.type };
            }
            acc[key].total += t.amount;
            return acc;
        }, {});

        let reportHTML = `<h3 class="text-xl font-bold mb-4 text-center">Report from ${startDate} to ${endDate}</h3>`;
        
        // Credits Table
        const credits = Object.entries(grouped).filter(([key, val]) => val.type === 'credit');
        if (credits.length > 0) {
            const totalCredits = credits.reduce((sum, [key, val]) => sum + val.total, 0);
            reportHTML += `<h4 class="font-semibold text-green-700 mt-6 mb-2">Funds In (Credit)</h4><table class="min-w-full divide-y"><thead><tr class="bg-gray-50"><th class="px-4 py-2 text-left">Source</th><th class="px-4 py-2 text-right">Total Amount</th></tr></thead><tbody>`;
            credits.forEach(([key, val]) => {
                reportHTML += `<tr><td class="px-4 py-2">${key}</td><td class="px-4 py-2 text-right">₹${val.total.toLocaleString('en-IN')}</td></tr>`;
            });
            reportHTML += `</tbody><tfoot class="bg-gray-100 font-bold"><tr class="border-t-2 border-gray-300"><td class="px-4 py-2 text-left">Total</td><td class="px-4 py-2 text-right">₹${totalCredits.toLocaleString('en-IN')}</td></tr></tfoot></table>`;
        }
        
        // Debits Table
        const debits = Object.entries(grouped).filter(([key, val]) => val.type === 'debit');
        if (debits.length > 0) {
            const totalDebits = debits.reduce((sum, [key, val]) => sum + val.total, 0);
            reportHTML += `<h4 class="font-semibold text-red-700 mt-6 mb-2">Expenses (Debit)</h4><table class="min-w-full divide-y"><thead><tr class="bg-gray-50"><th class="px-4 py-2 text-left">Category</th><th class="px-4 py-2 text-right">Total Amount</th></tr></thead><tbody>`;
            debits.forEach(([key, val]) => {
                reportHTML += `<tr><td class="px-4 py-2">${key}</td><td class="px-4 py-2 text-right">₹${val.total.toLocaleString('en-IN')}</td></tr>`;
            });
            reportHTML += `</tbody><tfoot class="bg-gray-100 font-bold"><tr class="border-t-2 border-gray-300"><td class="px-4 py-2 text-left">Total</td><td class="px-4 py-2 text-right">₹${totalDebits.toLocaleString('en-IN')}</td></tr></tfoot></table>`;
        }

        if (credits.length === 0 && debits.length === 0) {
             reportHTML += '<p class="text-center text-gray-500 mt-4">No transactions found in this period.</p>';
        }

        reportContent.innerHTML = reportHTML;
    }

    creditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(creditForm.querySelector('#credit-amount').value);
        const source = creditForm.querySelector('#credit-source').value;
        const date = creditForm.querySelector('#credit-date').value;
        
        db.fundTransactions.push({ id: Date.now(), type: 'credit', amount, description: source, date, category: 'Credit' });
        saveDatabase();
        updateSummaryAndTable();
        
        successMessage.textContent = `Successfully recorded fund in of ₹${amount} from ${source}.`;
        successMessage.classList.remove('hidden');
        creditForm.reset();
        document.getElementById('credit-date').valueAsDate = new Date();
        setTimeout(() => successMessage.classList.add('hidden'), 4000);
    });
    
    debitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(debitForm.querySelector('#debit-amount').value);
        const category = debitForm.querySelector('#debit-category').value;
        const remarks = debitForm.querySelector('#debit-remarks').value;
        const date = debitForm.querySelector('#debit-date').value;
        
        let description = category + (remarks ? ` - ${remarks}` : '');
        
        db.fundTransactions.push({ id: Date.now(), type: 'debit', amount, description, date, category });
        saveDatabase();
        updateSummaryAndTable();

        successMessage.textContent = `Successfully recorded expense of ₹${amount} for ${category}.`;
        successMessage.classList.remove('hidden');
        debitForm.reset();
        document.getElementById('debit-date').valueAsDate = new Date();
        setTimeout(() => successMessage.classList.add('hidden'), 4000);
    });
    
    openReportModalBtn.addEventListener('click', () => reportModal.classList.remove('hidden'));
    closeReportModalBtn.addEventListener('click', () => reportModal.classList.add('hidden'));
    runReportBtn.addEventListener('click', generateReport);


    const today = new Date().toISOString().split('T')[0];
    document.getElementById('credit-date').value = today;
    document.getElementById('debit-date').value = today;
    document.getElementById('report-end-date').value = today;
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    document.getElementById('report-start-date').value = startOfMonth.toISOString().split('T')[0];
    
    updateSummaryAndTable();
}

// =================================================================================
// KHARCHI PAGE LOGIC
// =================================================================================
function initializeKharchiPage() {
    const kharchiForm = document.getElementById('kharchi-form');
    if(!kharchiForm) return;
    
    const advanceForm = document.getElementById('advance-form');
    const kharchiSearchInput = document.getElementById('kharchi-employee-search');
    const kharchiResults = document.getElementById('kharchi-employee-results');
    const advanceSearchInput = document.getElementById('advance-employee-search');
    const advanceResults = document.getElementById('advance-employee-results');
    const successMessage = document.getElementById('success-message');
    const tableBody = document.getElementById('transaction-table-body');
    const noTransactionsRow = document.getElementById('no-transactions-row');
    const totalKharchiDisplay = document.getElementById('total-kharchi');
    const totalAdvanceDisplay = document.getElementById('total-advance');

    let selectedKharchiEmployee = null;
    let selectedAdvanceEmployee = null;
    
    function createSearchHandler(searchInput, resultsContainer, onSelect) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm) {
                const filtered = db.employees.filter(e => e.name.toLowerCase().includes(searchTerm) || e.id.toLowerCase().includes(searchTerm));
                renderResults(filtered, resultsContainer, onSelect, searchInput);
                resultsContainer.classList.remove('hidden');
            } else {
                resultsContainer.classList.add('hidden');
                onSelect(null);
            }
        });
    }
    
    function renderResults(filteredEmployees, resultsEl, onSelect, searchInput) {
        resultsEl.innerHTML = '';
        if (filteredEmployees.length === 0) {
            resultsEl.innerHTML = '<div class="px-4 py-2 text-gray-500">No results.</div>';
            return;
        }
        filteredEmployees.forEach(employee => {
            const item = document.createElement('div');
            item.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
            item.textContent = `${employee.name} (${employee.id})`;
            item.addEventListener('click', () => {
                onSelect(employee);
                searchInput.value = `${employee.name} (${employee.id})`;
                resultsEl.classList.add('hidden');
            });
            resultsEl.appendChild(item);
        });
    }

    function updateSummaryAndTable() {
        // Update Summary
        const totalKharchi = db.kharchi.filter(t => t.type === 'Kharchi').reduce((sum, t) => sum + t.amount, 0);
        const totalAdvance = db.kharchi.filter(t => t.type === 'Advance').reduce((sum, t) => sum + t.amount, 0);
        totalKharchiDisplay.textContent = `₹${totalKharchi.toLocaleString('en-IN')}`;
        totalAdvanceDisplay.textContent = `₹${totalAdvance.toLocaleString('en-IN')}`;
        
        // Update Table
        tableBody.innerHTML = '';
        if (db.kharchi.length === 0) {
            tableBody.appendChild(noTransactionsRow);
            return;
        }

        db.kharchi.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(t => {
            const row = document.createElement('tr');
            const typeClass = t.type === 'Kharchi' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${t.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${t.name}</td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeClass}">${t.type}</span></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold">₹${t.amount.toLocaleString('en-IN')}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${t.remarks || 'N/A'}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    kharchiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedKharchiEmployee) { alert('Please select an employee.'); return; }
        
        const amount = parseFloat(document.getElementById('kharchi-amount').value);
        const date = document.getElementById('kharchi-date').value;
        
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        
        const newTransaction = {
            id: Date.now(),
            type: 'Kharchi',
            employeeId: selectedKharchiEmployee.id,
            name: selectedKharchiEmployee.name,
            amount: amount,
            date: date,
            remarks: ''
        };
        
        db.kharchi.push(newTransaction);
        saveDatabase();
        updateSummaryAndTable();
        
        successMessage.textContent = `Kharchi of ₹${newTransaction.amount} for ${newTransaction.name} saved.`;
        successMessage.classList.remove('hidden');
        kharchiForm.reset();
        kharchiSearchInput.value = '';
        selectedKharchiEmployee = null;
        document.getElementById('kharchi-date').valueAsDate = new Date();
        setTimeout(() => successMessage.classList.add('hidden'), 4000);
    });
    
    advanceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedAdvanceEmployee) { alert('Please select an employee.'); return; }
        
        const amount = parseFloat(document.getElementById('advance-amount').value);
        const date = document.getElementById('advance-date').value;
        const remarks = document.getElementById('advance-remarks').value;
        
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        
        const newTransaction = {
            id: Date.now(),
            type: 'Advance',
            employeeId: selectedAdvanceEmployee.id,
            name: selectedAdvanceEmployee.name,
            amount: amount,
            date: date,
            remarks: remarks
        };
        
        db.kharchi.push(newTransaction);
        saveDatabase();
        updateSummaryAndTable();

        successMessage.textContent = `Advance of ₹${newTransaction.amount} for ${newTransaction.name} saved.`;
        successMessage.classList.remove('hidden');
        advanceForm.reset();
        advanceSearchInput.value = '';
        selectedAdvanceEmployee = null;
        document.getElementById('advance-date').valueAsDate = new Date();
        setTimeout(() => successMessage.classList.add('hidden'), 4000);
    });

    document.addEventListener('click', (event) => {
        if (!kharchiSearchInput.contains(event.target) && !kharchiResults.contains(event.target)) {
            kharchiResults.classList.add('hidden');
        }
        if (!advanceSearchInput.contains(event.target) && !advanceResults.contains(event.target)) {
            advanceResults.classList.add('hidden');
        }
    });

    document.getElementById('kharchi-date').valueAsDate = new Date();
    document.getElementById('advance-date').valueAsDate = new Date();
    
    createSearchHandler(kharchiSearchInput, kharchiResults, (employee) => { selectedKharchiEmployee = employee; });
    createSearchHandler(advanceSearchInput, advanceResults, (employee) => { selectedAdvanceEmployee = employee; });
    
    updateSummaryAndTable();
}

// =================================================================================
// PAYSHEET PAGE LOGIC
// =================================================================================
function initializePaysheetPage() {
    const monthSelector = document.getElementById('month-selector');
    if(!monthSelector) return;
    
    const generateBtn = document.getElementById('generate-btn');
    const tableBody = document.getElementById('paysheet-table-body');
    const tableFoot = document.getElementById('paysheet-table-foot');
    const paysheetTitle = document.getElementById('paysheet-title');
    const paysheetPeriod = document.getElementById('paysheet-period');

    function generatePaysheet() {
        const selectedMonth = monthSelector.value; // Format: yyyy-MM
        if (!selectedMonth) {
            alert('Please select a month.');
            return;
        }

        const [year, month] = selectedMonth.split('-');
        const periodStartDate = new Date(year, month - 1, 1);
        const periodEndDate = new Date(year, month, 0);

        paysheetTitle.textContent = `Paysheet for ${periodStartDate.toLocaleString('default', { month: 'long' })} ${year}`;
        paysheetPeriod.textContent = `Period: ${periodStartDate.toLocaleDateString()} to ${periodEndDate.toLocaleDateString()}`;

        tableBody.innerHTML = '';
        let serialNo = 1;
        
        // Grand totals
        let grandTotalWages = 0;
        let grandTotalAdvance = 0;
        let grandTotalKharchi = 0;
        let grandTotalNet = 0;

        db.employees.forEach(emp => {
            const empAttendance = db.attendance.filter(r => r.employeeId === emp.id && r.date.startsWith(selectedMonth));
            const empTransactions = db.kharchi.filter(t => t.employeeId === emp.id && t.date.startsWith(selectedMonth));

            const totalPresentDays = empAttendance.filter(r => r.status === 'Present').length;
            const totalOtHours = empAttendance.reduce((sum, r) => sum + r.otHours, 0);
            const totalAtd = empAttendance.reduce((sum, r) => sum + r.totalP, 0);
            
            const wages = totalAtd * emp.rate;
            
            const totalAdvance = empTransactions.filter(t => t.type === 'Advance').reduce((sum, t) => sum + t.amount, 0);
            const totalKharchi = empTransactions.filter(t => t.type === 'Kharchi').reduce((sum, t) => sum + t.amount, 0);
            
            const netPayment = wages - totalAdvance - totalKharchi;
            
            // Add to grand totals
            grandTotalWages += wages;
            grandTotalAdvance += totalAdvance;
            grandTotalKharchi += totalKharchi;
            grandTotalNet += netPayment;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-500">${serialNo++}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-500">${emp.id}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${emp.name}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-500">₹${emp.rate.toLocaleString('en-IN')}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-500">${totalPresentDays}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-gray-500">${totalOtHours.toFixed(1)}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm font-bold text-gray-800">${totalAtd.toFixed(2)}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm font-semibold text-green-700">₹${wages.toLocaleString('en-IN')}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-red-600">₹${totalAdvance.toLocaleString('en-IN')}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm text-red-600">₹${totalKharchi.toLocaleString('en-IN')}</td>
                <td class="px-2 py-4 whitespace-nowrap text-sm font-bold text-blue-700">₹${netPayment.toLocaleString('en-IN')}</td>
            `;
            tableBody.appendChild(row);
        });
        
        tableFoot.innerHTML = `
            <tr>
                <td colspan="7" class="px-2 py-3 text-right text-sm font-bold uppercase">Grand Totals</td>
                <td class="px-2 py-3 text-left text-sm font-semibold text-green-700">₹${grandTotalWages.toLocaleString('en-IN')}</td>
                <td class="px-2 py-3 text-left text-sm font-semibold text-red-600">₹${grandTotalAdvance.toLocaleString('en-IN')}</td>
                <td class="px-2 py-3 text-left text-sm font-semibold text-red-600">₹${grandTotalKharchi.toLocaleString('en-IN')}</td>
                <td class="px-2 py-3 text-left text-sm font-bold text-blue-700">₹${grandTotalNet.toLocaleString('en-IN')}</td>
            </tr>
        `;

        if (db.employees.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="11" class="px-6 py-4 text-center text-gray-500">No employees found.</td></tr>`;
            tableFoot.innerHTML = '';
        }
    }

    generateBtn.addEventListener('click', generatePaysheet);

    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    monthSelector.value = `${year}-${month}`;
} 