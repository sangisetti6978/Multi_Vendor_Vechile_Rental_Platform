// Admin Dashboard Functions

// Check authentication
if (!requireAuth('ADMIN')) {
    throw new Error('Authentication required');
}

// Load user info
const user = getUser();
document.getElementById('userName').textContent = user.fullName;
document.getElementById('userEmail').textContent = user.email;

// Show section function
function showSection(sectionName) {
    document.querySelectorAll('[id$="Section"]').forEach(section => {
        section.style.display = 'none';
    });
    
    document.getElementById(sectionName + 'Section').style.display = 'block';
    
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (sectionName === 'users') {
        loadAllUsers();
    } else if (sectionName === 'shops') {
        loadAllShops();
    } else if (sectionName === 'vehicles') {
        loadAllVehicles();
    } else if (sectionName === 'verify') {
        loadUnverifiedOwners();
    }
}

// Load all users
async function loadAllUsers() {
    try {
        const token = localStorage.getItem('token');
        const users = await apiCall('/api/admin/users', 'GET', null, token);
        
        const container = document.getElementById('usersList');
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Verified</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.fullName}</td>
                            <td>${user.email}</td>
                            <td><span class="badge badge-info">${user.role}</span></td>
                            <td>${user.isVerified ? '✅' : '❌'}</td>
                            <td><span class="badge ${user.isActive ? 'badge-success' : 'badge-danger'}">
                                ${user.isActive ? 'Active' : 'Inactive'}
                            </span></td>
                            <td>
                                ${!user.isVerified && user.role === 'OWNER' ? 
                                    `<button class="btn btn-primary btn-sm" onclick="verifyUser(${user.id})">Verify</button>` : ''}
                                <button class="btn btn-secondary btn-sm" onclick="toggleUserStatus(${user.id})">
                                    ${user.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        document.getElementById('usersList').innerHTML = '<p class="error">Failed to load users</p>';
        console.error('Error loading users:', error);
    }
}

// Load all shops
async function loadAllShops() {
    try {
        const token = localStorage.getItem('token');
        const shops = await apiCall('/api/admin/shops', 'GET', null, token);
        
        const container = document.getElementById('shopsList');
        
        if (shops.length === 0) {
            container.innerHTML = '<p>No shops found.</p>';
            return;
        }
        
        container.innerHTML = shops.map(shop => `
            <div class="card">
                <h3>${shop.shopName}</h3>
                <p><strong>Owner ID:</strong> ${shop.ownerId}</p>
                <p><strong>Location:</strong> ${shop.city}, ${shop.state}</p>
                <p><strong>Address:</strong> ${shop.address}</p>
                <p><strong>Contact:</strong> ${shop.phone}, ${shop.email}</p>
                <p><strong>Status:</strong> ${shop.isActive ? '✅ Active' : '❌ Inactive'}</p>
                <div class="card-actions">
                    <button class="btn btn-secondary btn-sm" onclick="toggleShopStatus(${shop.id})">
                        ${shop.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteShop(${shop.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('shopsList').innerHTML = '<p class="error">Failed to load shops</p>';
        console.error('Error loading shops:', error);
    }
}

// Load all vehicles
async function loadAllVehicles() {
    try {
        const token = localStorage.getItem('token');
        const vehicles = await apiCall('/api/admin/vehicles', 'GET', null, token);
        
        const container = document.getElementById('vehiclesList');
        
        if (vehicles.length === 0) {
            container.innerHTML = '<p>No vehicles found.</p>';
            return;
        }
        
        container.innerHTML = vehicles.map(vehicle => `
            <div class="card">
                <img src="${resolveVehicleImg(vehicle.imageUrl, vehicle.vehicleName)}" 
                     alt="${vehicle.vehicleName}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 5px; margin-bottom: 1rem;">
                <h3>${vehicle.vehicleName}</h3>
                <p><strong>Brand:</strong> ${vehicle.brand} ${vehicle.model}</p>
                <p><strong>Type:</strong> ${vehicle.vehicleType}</p>
                <p><strong>Shop:</strong> ${vehicle.shopName}</p>
                <p><strong>Location:</strong> ${vehicle.city}</p>
                <p><strong>Price:</strong> ₹${vehicle.pricePerDay}/day</p>
                <p><strong>Status:</strong> ${vehicle.isActive ? '✅ Active' : '❌ Inactive'}</p>
                <div class="card-actions">
                    <button class="btn btn-secondary btn-sm" onclick="toggleVehicleStatus(${vehicle.id})">
                        ${vehicle.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteVehicle(${vehicle.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('vehiclesList').innerHTML = '<p class="error">Failed to load vehicles</p>';
        console.error('Error loading vehicles:', error);
    }
}

// Load unverified owners
async function loadUnverifiedOwners() {
    try {
        const token = localStorage.getItem('token');
        const owners = await apiCall('/api/admin/owners/unverified', 'GET', null, token);
        
        const container = document.getElementById('unverifiedList');
        
        if (owners.length === 0) {
            container.innerHTML = '<p>No unverified owners.</p>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Registered On</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${owners.map(owner => `
                        <tr>
                            <td>${owner.id}</td>
                            <td>${owner.fullName}</td>
                            <td>${owner.email}</td>
                            <td>${owner.phone || 'N/A'}</td>
                            <td>${new Date(owner.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-primary btn-sm" onclick="verifyUser(${owner.id})">Verify</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteUser(${owner.id})">Reject</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        document.getElementById('unverifiedList').innerHTML = '<p class="error">Failed to load unverified owners</p>';
        console.error('Error loading unverified owners:', error);
    }
}

// Verify user
async function verifyUser(userId) {
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/admin/users/${userId}/verify`, 'PUT', null, token);
        alert('User verified successfully');
        loadAllUsers();
        loadUnverifiedOwners();
    } catch (error) {
        alert('Failed to verify user: ' + error.message);
    }
}

// Toggle user status
async function toggleUserStatus(userId) {
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/admin/users/${userId}/toggle-status`, 'PUT', null, token);
        loadAllUsers();
    } catch (error) {
        alert('Failed to update user status: ' + error.message);
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/admin/users/${userId}`, 'DELETE', null, token);
        alert('User deleted successfully');
        loadAllUsers();
    } catch (error) {
        alert('Failed to delete user: ' + error.message);
    }
}

// Toggle shop status
async function toggleShopStatus(shopId) {
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/admin/shops/${shopId}/toggle-status`, 'PUT', null, token);
        loadAllShops();
    } catch (error) {
        alert('Failed to update shop status: ' + error.message);
    }
}

// Delete shop
async function deleteShop(shopId) {
    if (!confirm('Are you sure you want to delete this shop? This will also delete all vehicles in this shop.')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/admin/shops/${shopId}`, 'DELETE', null, token);
        alert('Shop deleted successfully');
        loadAllShops();
    } catch (error) {
        alert('Failed to delete shop: ' + error.message);
    }
}

// Toggle vehicle status
async function toggleVehicleStatus(vehicleId) {
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/admin/vehicles/${vehicleId}/toggle-status`, 'PUT', null, token);
        loadAllVehicles();
    } catch (error) {
        alert('Failed to update vehicle status: ' + error.message);
    }
}

// Delete vehicle
async function deleteVehicle(vehicleId) {
    if (!confirm('Are you sure you want to delete this vehicle?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/admin/vehicles/${vehicleId}`, 'DELETE', null, token);
        alert('Vehicle deleted successfully');
        loadAllVehicles();
    } catch (error) {
        alert('Failed to delete vehicle: ' + error.message);
    }
}

// Initial load
loadAllUsers();
