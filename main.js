document.addEventListener("DOMContentLoaded", function() {
    fetch('templates/header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load header');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            
            // Activate current page link
            let currentPage = window.location.pathname.split('/').pop();
            // Handle root URL case (dashboard)
            if (!currentPage || currentPage === '') {
                currentPage = 'index.html';
            }
            
            const navLinks = document.querySelectorAll('nav a');
            navLinks.forEach(link => {
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('bg-gray-200');
                }
            });

            // Activate current page in mobile dropdown
            const mobileNav = document.getElementById('mobile-nav');
            if (mobileNav) {
                mobileNav.value = currentPage;
                mobileNav.addEventListener('change', function() {
                    if (this.value) {
                        window.location.href = this.value;
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error loading header:', error);
            // Fallback: create a simple header if fetch fails
            document.getElementById('header-placeholder').innerHTML = `
                <header class="bg-white shadow-md sticky top-0 z-40">
                    <nav class="container mx-auto px-4 lg:px-8 flex justify-between items-center py-4">
                        <div class="text-2xl font-bold text-blue-600">Site Manager</div>
                        <div class="hidden md:flex items-center space-x-2 lg:space-x-4">
                            <a href="index.html" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Dashboard</a>
                            <a href="add-employee.html" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Add Employee</a>
                            <a href="attendance.html" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Attendance</a>
                            <a href="kharchi.html" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Kharchi & Advance</a>
                            <a href="fund-management.html" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Fund Management</a>
                            <a href="paysheet.html" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Paysheet</a>
                        </div>
                        <div class="md:hidden">
                            <select id="mobile-nav" class="border border-gray-300 rounded-md p-2">
                                <option value="index.html">Dashboard</option>
                                <option value="add-employee.html">Add Employee</option>
                                <option value="attendance.html">Attendance</option>
                                <option value="kharchi.html">Kharchi & Advance</option>
                                <option value="fund-management.html">Fund Management</option>
                                <option value="paysheet.html">Paysheet</option>
                            </select>
                        </div>
                    </nav>
                </header>
            `;
        });
});
