// Owner Dashboard Functions

// Check authentication
if (!requireAuth('OWNER')) {
    throw new Error('Authentication required');
}

// Load user info
const user = getUser();
document.getElementById('userName').textContent = user.fullName;
document.getElementById('userEmail').textContent = user.email;
const avatarEl = document.getElementById('userAvatar');
if (avatarEl && user.fullName) avatarEl.textContent = user.fullName.charAt(0).toUpperCase();

let currentShops = [];

// Show section
function showSection(sectionName, trigger) {
    document.querySelectorAll('[id$="Section"]').forEach(s => s.style.display = 'none');
    document.getElementById(sectionName + 'Section').style.display = 'block';
    document.querySelectorAll('.side-nav-item').forEach(l => l.classList.remove('active'));
    if (trigger) trigger.classList.add('active');

    if (sectionName === 'shops') loadMyShops();
    else if (sectionName === 'vehicles') loadMyVehicles();
    else if (sectionName === 'bookings') loadMyBookings();
}

// ───────── SHOPS ─────────
async function loadMyShops() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        let shops = [];
        try {
            shops = await apiCall('/api/owner/shops', 'GET', null, token);
            if (!Array.isArray(shops)) shops = [];
        } catch (e) {
            console.error('Error fetching shops:', e);
            shops = [];
        }
        currentShops = shops;

        // Stats
        const active = shops.filter(s => s.isActive).length;
        const inactive = shops.length - active;
        document.getElementById('shopStats').innerHTML = `
            <div class="stat-chip"><span class="material-symbols-rounded">storefront</span><strong>${shops.length}</strong> Total</div>
            <div class="stat-chip stat-success"><span class="material-symbols-rounded">check_circle</span><strong>${active}</strong> Active</div>
            <div class="stat-chip stat-warn"><span class="material-symbols-rounded">pause_circle</span><strong>${inactive}</strong> Inactive</div>`;

        const container = document.getElementById('shopsList');
        if (!shops.length) {
            container.innerHTML = `<div class="empty-state"><span class="material-symbols-rounded">add_business</span><h3>No shops yet</h3><p>Create your first shop to start listing vehicles.</p></div>`;
            return;
        }

        container.innerHTML = shops.map(shop => `
            <div class="o-card">
                <div class="o-card-head">
                    <div class="o-card-icon"><span class="material-symbols-rounded">storefront</span></div>
                    <div>
                        <h3 class="o-card-title">${shop.shopName}</h3>
                        <span class="o-status ${shop.isActive ? 'o-status-active' : 'o-status-inactive'}">
                            <span class="material-symbols-rounded">${shop.isActive ? 'check_circle' : 'cancel'}</span>
                            ${shop.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
                <div class="o-card-body">
                    <div class="o-detail"><span class="material-symbols-rounded">location_on</span><span>${shop.city}, ${shop.state}</span></div>
                    <div class="o-detail"><span class="material-symbols-rounded">home</span><span>${shop.address}</span></div>
                    <div class="o-detail"><span class="material-symbols-rounded">call</span><span>${shop.phone}</span></div>
                    <div class="o-detail"><span class="material-symbols-rounded">mail</span><span>${shop.email}</span></div>
                </div>
                <div class="o-card-actions">
                    <button class="o-btn o-btn-primary" onclick="editShop(${shop.id})"><span class="material-symbols-rounded">edit</span> Edit</button>
                    <button class="o-btn o-btn-outline" onclick="toggleShopStatus(${shop.id})">${shop.isActive ? '<span class="material-symbols-rounded">pause</span> Deactivate' : '<span class="material-symbols-rounded">play_arrow</span> Activate'}</button>
                    <button class="o-btn o-btn-danger" onclick="deleteShop(${shop.id})"><span class="material-symbols-rounded">delete</span> Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('shopsList').innerHTML = '<div class="error-state"><span class="material-symbols-rounded">error</span><p>Failed to load shops</p></div>';
        console.error('Error loading shops:', error);
    }
}

// ───────── VEHICLES ─────────
async function loadMyVehicles() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        let shops = [];
        try {
            shops = await apiCall('/api/owner/shops', 'GET', null, token);
        } catch (e) {
            console.error('Error fetching shops for vehicles:', e);
            shops = [];
        }

        let allVehicles = [];
        for (const shop of shops) {
            try {
                const vehicles = await apiCall(`/api/owner/shops/${shop.id}/vehicles`, 'GET', null, token);
                if (Array.isArray(vehicles)) {
                    allVehicles = allVehicles.concat(vehicles);
                }
            } catch (e) {
                console.error(`Error fetching vehicles for shop ${shop.id}:`, e);
            }
        }

        // Cache for edit
        currentVehicles = allVehicles;

        // Stats
        const avail = allVehicles.filter(v => v.isAvailable).length;
        const activeV = allVehicles.filter(v => v.isActive).length;
        document.getElementById('vehicleStats').innerHTML = `
            <div class="stat-chip"><span class="material-symbols-rounded">directions_car</span><strong>${allVehicles.length}</strong> Total</div>
            <div class="stat-chip stat-success"><span class="material-symbols-rounded">check_circle</span><strong>${avail}</strong> Available</div>
            <div class="stat-chip stat-info"><span class="material-symbols-rounded">verified</span><strong>${activeV}</strong> Active</div>`;

        const container = document.getElementById('vehiclesList');
        if (!allVehicles.length) {
            container.innerHTML = `<div class="empty-state"><span class="material-symbols-rounded">directions_car</span><h3>No vehicles yet</h3><p>Add your first vehicle to a shop.</p></div>`;
            return;
        }

        container.innerHTML = allVehicles.map(v => `
            <div class="o-card o-card-vehicle">
                <div class="o-vehicle-img" style="background-image:url('${resolveVehicleImg(v.imageUrl, v.vehicleName)}')"></div>
                <div class="o-card-head">
                    <div>
                        <h3 class="o-card-title">${v.vehicleName}</h3>
                        <p class="o-card-sub">${v.brand} ${v.model} &bull; ${v.vehicleType}</p>
                    </div>
                    <span class="o-price">₹${v.pricePerDay}<small>/day</small></span>
                </div>
                <div class="o-card-body">
                    <div class="o-detail"><span class="material-symbols-rounded">local_gas_station</span><span>${v.fuelType || '—'}</span></div>
                    <div class="o-detail"><span class="material-symbols-rounded">settings</span><span>${v.transmission || '—'}</span></div>
                    <div class="o-detail"><span class="material-symbols-rounded">event_seat</span><span>${v.seatingCapacity} seats</span></div>
                    <div class="o-detail"><span class="material-symbols-rounded">storefront</span><span>${v.shopName}</span></div>
                </div>
                <div class="o-card-tags">
                    <span class="o-tag ${v.isAvailable ? 'o-tag-green' : 'o-tag-red'}">${v.isAvailable ? 'Available' : 'Unavailable'}</span>
                    <span class="o-tag ${v.isActive ? 'o-tag-blue' : 'o-tag-gray'}">${v.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div class="o-card-actions">
                    <button class="o-btn o-btn-primary" onclick="editVehicle(${v.id})"><span class="material-symbols-rounded">edit</span> Edit</button>
                    <button class="o-btn o-btn-outline" onclick="toggleVehicleAvailability(${v.id}, ${!v.isAvailable})">
                        ${v.isAvailable ? '<span class="material-symbols-rounded">block</span> Unavailable' : '<span class="material-symbols-rounded">check</span> Available'}
                    </button>
                    <button class="o-btn o-btn-danger" onclick="deleteVehicle(${v.id})"><span class="material-symbols-rounded">delete</span></button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('vehiclesList').innerHTML = '<div class="error-state"><span class="material-symbols-rounded">error</span><p>Failed to load vehicles</p></div>';
        console.error('Error loading vehicles:', error);
    }
}

// ───────── BOOKINGS ─────────
async function loadMyBookings() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        let shops = [];
        try {
            shops = await apiCall('/api/owner/shops', 'GET', null, token);
            if (!Array.isArray(shops)) shops = [];
        } catch (e) {
            console.error('Error fetching shops for bookings:', e);
            shops = [];
        }

        let allBookings = [];
        for (const shop of shops) {
            try {
                const bookings = await apiCall(`/api/owner/shops/${shop.id}/bookings`, 'GET', null, token);
                if (Array.isArray(bookings)) {
                    allBookings = allBookings.concat(bookings);
                }
            } catch (e) {
                console.error(`Error fetching bookings for shop ${shop.id}:`, e);
            }
        }
        // Stats
        const pending = allBookings.filter(b => b.status === 'PENDING').length;
        const accepted = allBookings.filter(b => b.status === 'ACCEPTED').length;
        const completed = allBookings.filter(b => b.status === 'COMPLETED').length;
        document.getElementById('bookingStats').innerHTML = `
            <div class="stat-chip"><span class="material-symbols-rounded">event_note</span><strong>${allBookings.length}</strong> Total</div>
            <div class="stat-chip stat-warn"><span class="material-symbols-rounded">hourglass_top</span><strong>${pending}</strong> Pending</div>
            <div class="stat-chip stat-info"><span class="material-symbols-rounded">thumb_up</span><strong>${accepted}</strong> Accepted</div>
            <div class="stat-chip stat-success"><span class="material-symbols-rounded">task_alt</span><strong>${completed}</strong> Completed</div>`;

        const container = document.getElementById('bookingsList');
        if (!allBookings.length) {
            container.innerHTML = `<div class="empty-state"><span class="material-symbols-rounded">event_busy</span><h3>No bookings yet</h3><p>Bookings from customers will appear here.</p></div>`;
            return;
        }
        allBookings.sort((a, b) => {
            if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
            if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
            return 0;
        });
        container.innerHTML = allBookings.map(b => {
            const statusClass = b.status.toLowerCase();
            const statusIcon = { pending: 'hourglass_top', accepted: 'thumb_up', completed: 'task_alt', cancelled: 'cancel', rejected: 'block' }[statusClass] || 'info';
            return `
            <div class="bk-card">
                <div class="bk-header">
                    <div class="bk-title-row">
                        <span class="material-symbols-rounded">directions_car</span>
                        <h3>${b.vehicleName}</h3>
                    </div>
                    <span class="bk-status bk-${statusClass}"><span class="material-symbols-rounded">${statusIcon}</span> ${b.status}</span>
                </div>
                <div class="bk-body">
                    <div class="bk-details">
                        <div class="bk-detail"><span class="bk-label">Customer</span><span class="bk-val">${b.customerName}</span></div>
                        <div class="bk-detail"><span class="bk-label">Email</span><span class="bk-val">${b.customerEmail}</span></div>
                        <div class="bk-detail"><span class="bk-label">Shop</span><span class="bk-val">${b.shopName}</span></div>
                        <div class="bk-detail"><span class="bk-label">Start</span><span class="bk-val">${new Date(b.startTime).toLocaleString()}</span></div>
                        <div class="bk-detail"><span class="bk-label">End</span><span class="bk-val">${new Date(b.endTime).toLocaleString()}</span></div>
                        <div class="bk-detail"><span class="bk-label">Duration</span><span class="bk-val">${b.totalHours} hours</span></div>
                        <div class="bk-detail"><span class="bk-label">Price</span><span class="bk-val bk-price">₹${b.totalPrice}</span></div>
                        ${b.status === 'PENDING' ? `<div class="bk-detail"><span class="bk-label">Deadline</span><span class="bk-val">${new Date(b.confirmationDeadline).toLocaleString()}</span></div>` : ''}
                    </div>
                    ${b.notes ? `<p class="bk-notes"><span class="material-symbols-rounded">notes</span> ${b.notes}</p>` : ''}
                    <div class="bk-actions">
                        ${b.status === 'PENDING' ? `
                            <button class="o-btn o-btn-primary" onclick="acceptBooking(${b.id})"><span class="material-symbols-rounded">check</span> Accept</button>
                            <button class="o-btn o-btn-danger" onclick="rejectBooking(${b.id})"><span class="material-symbols-rounded">close</span> Reject</button>
                        ` : ''}
                        ${b.status === 'ACCEPTED' ? `
                            <button class="o-btn o-btn-primary" onclick="completeBooking(${b.id})"><span class="material-symbols-rounded">task_alt</span> Complete</button>
                        ` : ''}
                    </div>
                </div>
            </div>`;
        }).join('');
    } catch (error) {
        document.getElementById('bookingsList').innerHTML = '<div class="error-state"><span class="material-symbols-rounded">error</span><p>Failed to load bookings</p></div>';
        console.error('Error loading bookings:', error);
    }
}

// ───────── MODALS ─────────
function showCreateShopModal() {
    document.getElementById('createShopModal').classList.add('open');
}
function showCreateVehicleModal() {
    const token = localStorage.getItem('token');
    apiCall('/api/owner/shops', 'GET', null, token).then(shops => {
        const select = document.getElementById('shopSelect');
        select.innerHTML = '<option value="">Select a shop</option>' +
            shops.map(s => `<option value="${s.id}">${s.shopName}</option>`).join('');
        document.getElementById('createVehicleModal').classList.add('open');
    }).catch(err => {
        console.error(err);
        alert('Please create a shop first before adding vehicles.');
    });
}
function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}
// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('open');
    });
});

// ───────── FORMS ─────────
document.getElementById('createShopForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const area = document.getElementById('shopArea').value;
    const addressText = formData.get('address');
    const fullAddress = area ? `${addressText}, ${area}` : addressText;

    const shop = {
        shopName: formData.get('shopName'),
        description: formData.get('description'),
        address: fullAddress,
        area: area,
        city: formData.get('city'),
        state: formData.get('state'),
        pincode: formData.get('pincode'),
        phone: formData.get('phone'),
        email: formData.get('email')
    };

    try {
        const token = localStorage.getItem('token');
        await apiCall('/api/owner/shops', 'POST', shop, token);
        alert('Shop created successfully!');
        closeModal('createShopModal');
        e.target.reset();
        loadMyShops();
    } catch (error) {
        alert('Failed to create shop: ' + error.message);
    }
});

// ───────── IMAGE UPLOAD ─────────
function previewVehicleImage(input) {
    const preview = document.getElementById('vehicleImgPreview');
    const placeholder = document.getElementById('vehicleImgPlaceholder');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.style.display = 'none';
        placeholder.style.display = '';
    }
}

async function uploadVehicleImage(file) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    const resp = await fetch(API_BASE_URL + '/api/upload/vehicle-image', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
    });
    if (!resp.ok) throw new Error('Image upload failed');
    const data = await resp.json();
    return data.imageUrl; // e.g. /uploads/vehicles/uuid.jpg
}

document.getElementById('createVehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Upload image first if a file was selected
    let imageUrl = '';
    const fileInput = document.getElementById('vehicleImageFile');
    if (fileInput.files && fileInput.files[0]) {
        try {
            imageUrl = await uploadVehicleImage(fileInput.files[0]);
        } catch (err) {
            alert('Image upload failed: ' + err.message);
            return;
        }
    }

    const vehicle = {
        shopId: parseInt(formData.get('shopId')),
        vehicleName: formData.get('vehicleName'),
        brand: formData.get('brand'),
        model: formData.get('model'),
        vehicleType: formData.get('vehicleType'),
        registrationNumber: formData.get('registrationNumber') || null,
        fuelType: formData.get('fuelType'),
        transmission: formData.get('transmission'),
        seatingCapacity: parseInt(formData.get('seatingCapacity')),
        pricePerDay: parseFloat(formData.get('pricePerDay')),
        description: formData.get('description'),
        imageUrl: imageUrl,
        isAvailable: true,
        isActive: true
    };

    try {
        const token = localStorage.getItem('token');
        await apiCall('/api/owner/vehicles', 'POST', vehicle, token);
        alert('Vehicle added successfully!');
        closeModal('createVehicleModal');
        e.target.reset();
        // Reset image preview
        document.getElementById('vehicleImgPreview').style.display = 'none';
        document.getElementById('vehicleImgPlaceholder').style.display = '';
        loadMyVehicles();
    } catch (error) {
        alert('Failed to add vehicle: ' + error.message);
    }
});

// ───────── EDIT SHOP ─────────
function editShop(shopId) {
    const shop = currentShops.find(s => s.id === shopId);
    if (!shop) return;
    document.getElementById('editShopId').value = shopId;
    document.getElementById('editShopName').value = shop.shopName || '';
    document.getElementById('editShopDescription').value = shop.description || '';
    document.getElementById('editShopAddress').value = shop.address || '';
    document.getElementById('editShopPhone').value = shop.phone || '';
    document.getElementById('editShopEmail').value = shop.email || '';
    document.getElementById('editShopModal').classList.add('open');
}
document.getElementById('editShopForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const shopId = document.getElementById('editShopId').value;
    const shop = currentShops.find(s => s.id == shopId);
    const updated = {
        shopName: document.getElementById('editShopName').value,
        description: document.getElementById('editShopDescription').value,
        address: document.getElementById('editShopAddress').value,
        phone: document.getElementById('editShopPhone').value,
        email: document.getElementById('editShopEmail').value,
        city: shop ? shop.city : '',
        state: shop ? shop.state : '',
        pincode: shop ? shop.pincode : ''
    };
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/owner/shops/${shopId}`, 'PUT', updated, token);
        alert('Shop updated successfully!');
        closeModal('editShopModal');
        loadMyShops();
    } catch (error) {
        alert('Failed to update shop: ' + error.message);
    }
});

// ───────── ACTIONS ─────────
async function toggleShopStatus(shopId) {
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/owner/shops/${shopId}/toggle-status`, 'PUT', null, token);
        loadMyShops();
    } catch (error) { alert('Failed to update shop status: ' + error.message); }
}
async function deleteShop(shopId) {
    if (!confirm('Are you sure you want to delete this shop? All vehicles in this shop will also be deleted.')) return;
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/owner/shops/${shopId}`, 'DELETE', null, token);
        alert('Shop deleted successfully');
        loadMyShops();
    } catch (error) { alert('Failed to delete shop: ' + error.message); }
}
async function toggleVehicleAvailability(vehicleId, isAvailable) {
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/owner/vehicles/${vehicleId}/availability`, 'PUT', { isAvailable }, token);
        loadMyVehicles();
    } catch (error) { alert('Failed to update vehicle: ' + error.message); }
}
async function deleteVehicle(vehicleId) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/owner/vehicles/${vehicleId}`, 'DELETE', null, token);
        alert('Vehicle deleted successfully');
        loadMyVehicles();
    } catch (error) { alert('Failed to delete vehicle: ' + error.message); }
}
// ───────── EDIT VEHICLE ─────────
let currentVehicles = [];

function previewEditVehicleImage(input) {
    const preview = document.getElementById('editVehicleImgPreview');
    const placeholder = document.getElementById('editVehicleImgPlaceholder');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.style.display = 'none';
        placeholder.style.display = '';
    }
}

async function editVehicle(vehicleId) {
    // Try to find the vehicle from cached data, otherwise fetch it
    let vehicle = currentVehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
        try {
            const token = localStorage.getItem('token');
            vehicle = await apiCall(`/api/vehicles/${vehicleId}`, 'GET', null, token);
        } catch (err) {
            alert('Failed to load vehicle details: ' + err.message);
            return;
        }
    }
    if (!vehicle) {
        alert('Vehicle not found');
        return;
    }

    // Populate edit form
    document.getElementById('editVehicleId').value = vehicleId;
    document.getElementById('editVehicleName').value = vehicle.vehicleName || '';
    document.getElementById('editRegistrationNumber').value = vehicle.registrationNumber || '';
    document.getElementById('editVehicleType').value = vehicle.vehicleType || 'CAR';
    document.getElementById('editVehicleBrand').value = vehicle.brand || '';
    document.getElementById('editVehicleModel').value = vehicle.model || '';
    document.getElementById('editFuelType').value = vehicle.fuelType || 'PETROL';
    document.getElementById('editTransmission').value = vehicle.transmission || 'MANUAL';
    document.getElementById('editSeatingCapacity').value = vehicle.seatingCapacity || '';
    document.getElementById('editPricePerDay').value = vehicle.pricePerDay || '';
    document.getElementById('editVehicleDescription').value = vehicle.description || '';

    // Show current image if exists
    const preview = document.getElementById('editVehicleImgPreview');
    const placeholder = document.getElementById('editVehicleImgPlaceholder');
    const fileInput = document.getElementById('editVehicleImageFile');
    fileInput.value = '';
    if (vehicle.imageUrl) {
        preview.src = resolveVehicleImg(vehicle.imageUrl, vehicle.vehicleName);
        preview.style.display = 'block';
        placeholder.style.display = 'none';
    } else {
        preview.style.display = 'none';
        placeholder.style.display = '';
    }

    document.getElementById('editVehicleModal').classList.add('open');
}

document.getElementById('editVehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const vehicleId = document.getElementById('editVehicleId').value;

    // Upload new image if selected
    let imageUrl = null;
    const fileInput = document.getElementById('editVehicleImageFile');
    if (fileInput.files && fileInput.files[0]) {
        try {
            imageUrl = await uploadVehicleImage(fileInput.files[0]);
        } catch (err) {
            alert('Image upload failed: ' + err.message);
            return;
        }
    }

    // Find existing vehicle to preserve fields not in the form
    const existing = currentVehicles.find(v => v.id == vehicleId) || {};

    const updated = {
        vehicleName: document.getElementById('editVehicleName').value,
        registrationNumber: document.getElementById('editRegistrationNumber').value || null,
        vehicleType: document.getElementById('editVehicleType').value,
        brand: document.getElementById('editVehicleBrand').value,
        model: document.getElementById('editVehicleModel').value,
        fuelType: document.getElementById('editFuelType').value,
        transmission: document.getElementById('editTransmission').value,
        seatingCapacity: parseInt(document.getElementById('editSeatingCapacity').value),
        pricePerDay: parseFloat(document.getElementById('editPricePerDay').value),
        description: document.getElementById('editVehicleDescription').value,
        imageUrl: imageUrl || existing.imageUrl || '',
        shopId: existing.shopId,
        isAvailable: existing.isAvailable !== undefined ? existing.isAvailable : true,
        isActive: existing.isActive !== undefined ? existing.isActive : true
    };

    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/owner/vehicles/${vehicleId}`, 'PUT', updated, token);
        alert('Vehicle updated successfully!');
        closeModal('editVehicleModal');
        loadMyVehicles();
    } catch (error) {
        alert('Failed to update vehicle: ' + error.message);
    }
});
async function acceptBooking(bookingId) {
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/owner/bookings/${bookingId}/accept`, 'PUT', null, token);
        alert('Booking accepted successfully');
        loadMyBookings();
    } catch (error) { alert('Failed to accept booking: ' + error.message); }
}
async function rejectBooking(bookingId) {
    if (!confirm('Are you sure you want to reject this booking?')) return;
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/owner/bookings/${bookingId}/reject`, 'PUT', null, token);
        alert('Booking rejected');
        loadMyBookings();
    } catch (error) { alert('Failed to reject booking: ' + error.message); }
}
async function completeBooking(bookingId) {
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/owner/bookings/${bookingId}/complete`, 'PUT', null, token);
        alert('Booking marked as completed');
        loadMyBookings();
    } catch (error) { alert('Failed to complete booking: ' + error.message); }
}

// Initial load
loadMyShops();
