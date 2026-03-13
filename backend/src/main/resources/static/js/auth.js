// Authentication Helper Functions

function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function getUserRole() {
    const user = getUser();
    return user ? user.role : null;
}

function requireAuth(requiredRole = null) {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (requiredRole) {
        const role = getUserRole();
        if (role !== requiredRole) {
            alert('Access denied. Insufficient permissions.');
            window.location.href = 'index.html';
            return false;
        }
    }
    
    return true;
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

function checkAuth() {
    if (isAuthenticated()) {
        const user = getUser();
        // Show logged-in nav elements, hide guest elements
        document.querySelectorAll('.nav-guest').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.nav-auth').forEach(el => el.style.display = '');
        // Populate profile info in navbar
        const avatarEl = document.getElementById('navAvatar');
        const nameEl = document.getElementById('navUserName');
        if (avatarEl && user.fullName) avatarEl.textContent = user.fullName.charAt(0).toUpperCase();
        if (nameEl) nameEl.textContent = user.fullName;
    } else {
        document.querySelectorAll('.nav-guest').forEach(el => el.style.display = '');
        document.querySelectorAll('.nav-auth').forEach(el => el.style.display = 'none');
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        isAuthenticated, 
        getUser, 
        getUserRole, 
        requireAuth, 
        logout, 
        checkAuth 
    };
}
