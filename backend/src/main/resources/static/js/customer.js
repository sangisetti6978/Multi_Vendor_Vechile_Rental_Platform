// Customer Dashboard Functions

// Check authentication
if (!requireAuth('CUSTOMER')) {
    throw new Error('Authentication required');
}

// Load user info
const user = getUser();
document.getElementById('userName').textContent = user.fullName;
document.getElementById('userEmail').textContent = user.email;

// Set avatar initial
const avatarEl = document.getElementById('userAvatar');
if (avatarEl && user.fullName) {
    avatarEl.textContent = user.fullName.charAt(0).toUpperCase();
}

// Store countdown intervals to clear them when needed
let countdownIntervals = {};

// Show section function
function showSection(sectionName) {
    document.querySelectorAll('[id$="Section"]').forEach(section => {
        section.style.display = 'none';
    });
    
    document.getElementById(sectionName + 'Section').style.display = 'block';
    
    document.querySelectorAll('.side-nav-item').forEach(link => {
        link.classList.remove('active');
    });
    event.target.closest('.side-nav-item').classList.add('active');
    
    if (sectionName === 'bookings') {
        loadMyBookings();
    }
}

// Format time remaining
function formatTimeRemaining(milliseconds) {
    if (milliseconds <= 0) {
        return { text: 'EXPIRED', isExpired: true };
    }
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const text = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    return { 
        text, 
        isExpired: false,
        isUrgent: totalSeconds < 1800,
        isCritical: totalSeconds < 600
    };
}

// Start countdown timer for a booking
function startCountdown(bookingId, deadline) {
    if (countdownIntervals[bookingId]) {
        clearInterval(countdownIntervals[bookingId]);
    }
    
    const timerElement = document.getElementById(`timer-${bookingId}`);
    const statusElement = document.getElementById(`status-${bookingId}`);
    
    if (!timerElement) return;
    
    const updateTimer = () => {
        const now = new Date().getTime();
        const deadlineTime = new Date(deadline).getTime();
        const remaining = deadlineTime - now;
        
        const timeInfo = formatTimeRemaining(remaining);
        timerElement.textContent = timeInfo.text;
        
        timerElement.classList.remove('timer-normal', 'timer-urgent', 'timer-critical', 'timer-expired');
        
        if (timeInfo.isExpired) {
            timerElement.classList.add('timer-expired');
            if (statusElement) {
                statusElement.innerHTML = '<span class="material-symbols-rounded">cancel</span> Auto-Cancelled';
                statusElement.className = 'bk-badge b-cancelled';
            }
            clearInterval(countdownIntervals[bookingId]);
            setTimeout(() => loadMyBookings(), 2000);
        } else if (timeInfo.isCritical) {
            timerElement.classList.add('timer-critical');
        } else if (timeInfo.isUrgent) {
            timerElement.classList.add('timer-urgent');
        } else {
            timerElement.classList.add('timer-normal');
        }
    };
    
    updateTimer();
    countdownIntervals[bookingId] = setInterval(updateTimer, 1000);
}

// Badge icon map
function getStatusIcon(status) {
    const icons = {
        'PENDING': 'schedule',
        'ACCEPTED': 'check_circle',
        'COMPLETED': 'verified',
        'REJECTED': 'block',
        'CANCELLED': 'cancel'
    };
    return icons[status] || 'info';
}

// Render stats
function renderStats(bookings) {
    const statsContainer = document.getElementById('bookingStats');
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'PENDING').length;
    const accepted = bookings.filter(b => b.status === 'ACCEPTED').length;
    const rejected = bookings.filter(b => b.status === 'REJECTED').length;

    statsContainer.innerHTML = `
        <div class="stat-chip">
            <div class="stat-icon total"><span class="material-symbols-rounded">confirmation_number</span></div>
            <div class="stat-info"><div class="stat-count">${total}</div><div class="stat-label">Total Bookings</div></div>
        </div>
        <div class="stat-chip">
            <div class="stat-icon pending"><span class="material-symbols-rounded">hourglass_top</span></div>
            <div class="stat-info"><div class="stat-count">${pending}</div><div class="stat-label">Pending</div></div>
        </div>
        <div class="stat-chip">
            <div class="stat-icon accepted"><span class="material-symbols-rounded">thumb_up</span></div>
            <div class="stat-info"><div class="stat-count">${accepted}</div><div class="stat-label">Accepted</div></div>
        </div>
        <div class="stat-chip">
            <div class="stat-icon rejected"><span class="material-symbols-rounded">thumb_down</span></div>
            <div class="stat-info"><div class="stat-count">${rejected}</div><div class="stat-label">Rejected</div></div>
        </div>
    `;
}

// Load bookings
async function loadMyBookings() {
    Object.values(countdownIntervals).forEach(interval => clearInterval(interval));
    countdownIntervals = {};
    
    try {
        const token = localStorage.getItem('token');
        const bookings = await apiCall('/api/customer/bookings', 'GET', null, token);
        
        const container = document.getElementById('bookingsList');
        
        if (bookings.length === 0) {
            document.getElementById('bookingStats').innerHTML = '';
            container.innerHTML = `
                <div class="empty-bookings">
                    <span class="material-symbols-rounded">directions_car</span>
                    <h3>No bookings yet</h3>
                    <p>Start exploring vehicles and make your first reservation!</p>
                    <a href="vehicle-search.html" class="btn-new-booking"><span class="material-symbols-rounded">add</span> Book a Vehicle</a>
                </div>`;
            return;
        }
        
        // Render stats
        renderStats(bookings);
        
        container.innerHTML = bookings.map(booking => {
            const isPending = booking.status === 'PENDING';
            const isAccepted = booking.status === 'ACCEPTED';
            const sl = booking.status.toLowerCase();
            
            return `
            <div class="bk-card s-${sl}">
                <div class="bk-accent"></div>
                <div class="bk-body">
                    <div class="bk-header">
                        <div class="bk-vehicle-info">
                            <div class="bk-vehicle-icon">
                                <span class="material-symbols-rounded">directions_car</span>
                            </div>
                            <div>
                                <div class="bk-vehicle-name">${booking.vehicleName}</div>
                                <div class="bk-shop-name">
                                    <span class="material-symbols-rounded">storefront</span>
                                    ${booking.shopName}
                                </div>
                            </div>
                        </div>
                        <span id="status-${booking.id}" class="bk-badge b-${sl}">
                            <span class="material-symbols-rounded">${getStatusIcon(booking.status)}</span>
                            ${booking.status}
                        </span>
                    </div>
                    
                    ${isPending ? `
                    <div class="bk-timer-box">
                        <div class="bk-timer-header">
                            <span class="material-symbols-rounded">timer</span>
                            <span class="bk-timer-label">Confirmation Countdown</span>
                        </div>
                        <div id="timer-${booking.id}" class="countdown-timer timer-normal">--:--:--</div>
                        <p class="bk-timer-warning">
                            <span class="material-symbols-rounded" style="font-size:1rem">warning</span>
                            Owner must accept before timer expires or booking will be auto-cancelled
                        </p>
                        <p class="bk-timer-hint">Visit the shop for faster confirmation</p>
                    </div>
                    ` : ''}
                    
                    ${isAccepted ? `
                    <div class="bk-confirmed-box">
                        <span class="material-symbols-rounded">verified</span>
                        Booking Confirmed by Owner!
                    </div>
                    ${booking.paymentStatus === 'PENDING' ? `
                    <div class="bk-payment-box">
                        <div class="payment-label">
                            <span class="material-symbols-rounded">payment</span>
                            Payment Required
                        </div>
                        <div class="payment-amount">₹${booking.totalPrice}</div>
                        <button class="bk-btn-pay" onclick="openPaymentModal(${booking.id}, '${booking.vehicleName}', '${booking.shopName}', ${booking.totalPrice}, ${booking.totalHours})">
                            <span class="material-symbols-rounded">credit_card</span> Pay Now
                        </button>
                    </div>
                    ` : ''}
                    ${booking.paymentStatus === 'COMPLETED' ? `
                    <div class="bk-payment-done">
                        <span class="material-symbols-rounded">paid</span>
                        Payment Completed Successfully
                        <button class="bk-btn-receipt" onclick="viewReceipt(${booking.id})">
                            <span class="material-symbols-rounded">receipt_long</span> View Receipt
                        </button>
                    </div>
                    ` : ''}
                    ` : ''}
                    
                    <div class="bk-details">
                        <div class="bk-detail">
                            <span class="material-symbols-rounded">event</span>
                            <div>
                                <div class="bk-detail-label">Start Date</div>
                                <div class="bk-detail-value">${new Date(booking.startTime).toLocaleString()}</div>
                            </div>
                        </div>
                        <div class="bk-detail">
                            <span class="material-symbols-rounded">event_available</span>
                            <div>
                                <div class="bk-detail-label">End Date</div>
                                <div class="bk-detail-value">${new Date(booking.endTime).toLocaleString()}</div>
                            </div>
                        </div>
                        <div class="bk-detail">
                            <span class="material-symbols-rounded">schedule</span>
                            <div>
                                <div class="bk-detail-label">Duration</div>
                                <div class="bk-detail-value">${booking.totalHours} hours</div>
                            </div>
                        </div>
                        <div class="bk-detail">
                            <span class="material-symbols-rounded">payments</span>
                            <div>
                                <div class="bk-detail-label">Total Price</div>
                                <div class="bk-detail-value">$${booking.totalPrice}</div>
                            </div>
                        </div>
                        <div class="bk-detail">
                            <span class="material-symbols-rounded">edit_calendar</span>
                            <div>
                                <div class="bk-detail-label">Booked On</div>
                                <div class="bk-detail-value">${new Date(booking.bookingDate).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                    
                    ${booking.notes ? `
                    <div class="bk-notes">
                        <span class="material-symbols-rounded">sticky_note_2</span>
                        <div>${booking.notes}</div>
                    </div>` : ''}
                    
                    ${(isPending || booking.status === 'COMPLETED') ? `
                    <div class="bk-actions">
                        ${isPending ? 
                            `<button class="bk-btn bk-btn-danger" onclick="cancelBooking(${booking.id})">
                                <span class="material-symbols-rounded">close</span> Cancel Booking
                            </button>` : ''}
                        ${booking.status === 'COMPLETED' ? 
                            `<button class="bk-btn bk-btn-primary" onclick="addReview(${booking.id}, ${booking.vehicleId})">
                                <span class="material-symbols-rounded">rate_review</span> Add Review
                            </button>` : ''}
                    </div>` : ''}
                </div>
            </div>
        `}).join('');
        
        // Start countdown timers for pending bookings
        bookings.forEach(booking => {
            if (booking.status === 'PENDING' && booking.confirmationDeadline) {
                startCountdown(booking.id, booking.confirmationDeadline);
            }
        });
        
    } catch (error) {
        document.getElementById('bookingStats').innerHTML = '';
        document.getElementById('bookingsList').innerHTML = `
            <div class="error-state">
                <span class="material-symbols-rounded">error</span>
                <p>Failed to load bookings. Please try again.</p>
            </div>`;
        console.error('Error loading bookings:', error);
    }
}

// Cancel booking
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        await apiCall(`/api/customer/bookings/${bookingId}/cancel`, 'PUT', null, token);
        alert('Booking cancelled successfully');
        loadMyBookings();
    } catch (error) {
        alert('Failed to cancel booking: ' + error.message);
    }
}

// Add review
function addReview(bookingId, vehicleId) {
    const rating = prompt('Rate this vehicle (1-5 stars):');
    if (!rating || rating < 1 || rating > 5) {
        alert('Please enter a valid rating between 1 and 5');
        return;
    }
    
    const comment = prompt('Add your review comment (optional):');
    
    submitReview(bookingId, vehicleId, parseInt(rating), comment);
}

async function submitReview(bookingId, vehicleId, rating, comment) {
    try {
        const token = localStorage.getItem('token');
        await apiCall('/api/customer/reviews', 'POST', {
            bookingId,
            vehicleId,
            rating,
            comment: comment || ''
        }, token);
        alert('Review submitted successfully!');
    } catch (error) {
        alert('Failed to submit review: ' + error.message);
    }
}

// Initial load
loadMyBookings();

// ───────── PAYMENT FUNCTIONS ─────────

// Store current modal context
let selectedPaymentMethod = null;
let currentPaymentBookingData = null;

function openPaymentModal(bookingId, vehicleName, shopName, totalPrice, totalHours) {
    const existing = document.getElementById('paymentModal');
    if (existing) existing.remove();

    currentPaymentBookingData = { bookingId, vehicleName, shopName, totalPrice, totalHours };

    const modal = document.createElement('div');
    modal.id = 'paymentModal';
    modal.className = 'payment-modal-overlay';
    modal.innerHTML = `
        <div class="payment-modal">
            <div class="payment-modal-header">
                <h3><span class="material-symbols-rounded" style="vertical-align:middle;margin-right:.3rem">payment</span> Complete Payment</h3>
                <p>Secure checkout for your vehicle booking</p>
            </div>
            <div class="payment-modal-body">
                <div class="payment-summary">
                    <div class="payment-summary-row">
                        <span>Vehicle</span>
                        <strong>${vehicleName}</strong>
                    </div>
                    <div class="payment-summary-row">
                        <span>Shop</span>
                        <strong>${shopName}</strong>
                    </div>
                    <div class="payment-summary-row">
                        <span>Duration</span>
                        <strong>${totalHours} hours</strong>
                    </div>
                    <div class="payment-summary-row total">
                        <span>Total Amount</span>
                        <strong>₹${totalPrice}</strong>
                    </div>
                </div>

                <div class="payment-methods">
                    <label>Select Payment Method</label>
                    <div class="payment-method-options">
                        <div class="payment-method-option" onclick="selectPaymentMethod(this, 'UPI')">
                            <input type="radio" name="payMethod" value="UPI">
                            <span class="pm-radio"></span>
                            <div class="pm-icon upi"><span class="material-symbols-rounded">smartphone</span></div>
                            <div><div class="pm-label">UPI</div><div class="pm-desc">Google Pay, PhonePe, Paytm</div></div>
                        </div>
                        <div class="payment-method-option" onclick="selectPaymentMethod(this, 'CREDIT_CARD')">
                            <input type="radio" name="payMethod" value="CREDIT_CARD">
                            <span class="pm-radio"></span>
                            <div class="pm-icon card"><span class="material-symbols-rounded">credit_card</span></div>
                            <div><div class="pm-label">Credit / Debit Card</div><div class="pm-desc">Visa, Mastercard, Rupay</div></div>
                        </div>
                        <div class="payment-method-option" onclick="selectPaymentMethod(this, 'NET_BANKING')">
                            <input type="radio" name="payMethod" value="NET_BANKING">
                            <span class="pm-radio"></span>
                            <div class="pm-icon netbanking"><span class="material-symbols-rounded">account_balance</span></div>
                            <div><div class="pm-label">Net Banking</div><div class="pm-desc">All major banks supported</div></div>
                        </div>
                        <div class="payment-method-option" onclick="selectPaymentMethod(this, 'CASH')">
                            <input type="radio" name="payMethod" value="CASH">
                            <span class="pm-radio"></span>
                            <div class="pm-icon cash"><span class="material-symbols-rounded">money</span></div>
                            <div><div class="pm-label">Cash on Delivery</div><div class="pm-desc">Pay when you pick up the vehicle</div></div>
                        </div>
                    </div>
                </div>

                <!-- Dynamic payment details area -->
                <div id="paymentDetailsArea"></div>
            </div>
            <div class="payment-modal-actions">
                <button class="pay-btn pay-btn-cancel" onclick="closePaymentModal()">Cancel</button>
                <button id="confirmPayBtn" class="pay-btn pay-btn-confirm" disabled onclick="processPayment(${bookingId})">
                    <span class="material-symbols-rounded">lock</span> Pay ₹${totalPrice}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePaymentModal();
    });
}

function selectPaymentMethod(el, method) {
    selectedPaymentMethod = method;
    document.querySelectorAll('.payment-method-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    el.querySelector('input[type="radio"]').checked = true;

    const area = document.getElementById('paymentDetailsArea');
    const btn = document.getElementById('confirmPayBtn');

    if (method === 'UPI') {
        area.innerHTML = `
            <div class="pay-input-section">
                <label class="pay-input-label">Enter your UPI ID</label>
                <div class="pay-input-group">
                    <span class="pay-input-icon material-symbols-rounded">smartphone</span>
                    <input type="text" id="upiIdInput" class="pay-input" placeholder="yourname@upi" autocomplete="off">
                </div>
                <p class="pay-input-hint">Example: 9876543210@ybl, name@oksbi, name@paytm</p>
                <div class="upi-pay-info">
                    <span class="material-symbols-rounded">info</span>
                    <span>A payment request of <strong>₹${currentPaymentBookingData.totalPrice}</strong> will be sent to this UPI ID</span>
                </div>
            </div>`;
        btn.disabled = true;
        document.getElementById('upiIdInput').addEventListener('input', validatePaymentForm);
    } else if (method === 'CREDIT_CARD') {
        area.innerHTML = `
            <div class="pay-input-section">
                <label class="pay-input-label">Card Details</label>
                <div class="pay-input-group">
                    <span class="pay-input-icon material-symbols-rounded">credit_card</span>
                    <input type="text" id="cardNumberInput" class="pay-input" placeholder="1234 5678 9012 3456" maxlength="19" autocomplete="off">
                </div>
                <div class="pay-input-row">
                    <div class="pay-input-group half">
                        <span class="pay-input-icon material-symbols-rounded">event</span>
                        <input type="text" id="cardExpiryInput" class="pay-input" placeholder="MM/YY" maxlength="5" autocomplete="off">
                    </div>
                    <div class="pay-input-group half">
                        <span class="pay-input-icon material-symbols-rounded">lock</span>
                        <input type="password" id="cardCvvInput" class="pay-input" placeholder="CVV" maxlength="3" autocomplete="off">
                    </div>
                </div>
                <div class="pay-input-group">
                    <span class="pay-input-icon material-symbols-rounded">person</span>
                    <input type="text" id="cardNameInput" class="pay-input" placeholder="Name on card" autocomplete="off">
                </div>
            </div>`;
        btn.disabled = true;
        document.getElementById('cardNumberInput').addEventListener('input', function() {
            let v = this.value.replace(/\D/g, '').substring(0, 16);
            this.value = v.replace(/(.{4})/g, '$1 ').trim();
            validatePaymentForm();
        });
        document.getElementById('cardExpiryInput').addEventListener('input', function() {
            let v = this.value.replace(/\D/g, '').substring(0, 4);
            if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2);
            this.value = v;
            validatePaymentForm();
        });
        document.getElementById('cardCvvInput').addEventListener('input', validatePaymentForm);
        document.getElementById('cardNameInput').addEventListener('input', validatePaymentForm);
    } else if (method === 'NET_BANKING') {
        area.innerHTML = `
            <div class="pay-input-section">
                <label class="pay-input-label">Select Your Bank</label>
                <div class="pay-input-group">
                    <span class="pay-input-icon material-symbols-rounded">account_balance</span>
                    <select id="bankSelect" class="pay-input pay-select">
                        <option value="">-- Choose Bank --</option>
                        <option value="SBI">State Bank of India</option>
                        <option value="HDFC">HDFC Bank</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="AXIS">Axis Bank</option>
                        <option value="BOB">Bank of Baroda</option>
                        <option value="PNB">Punjab National Bank</option>
                        <option value="KOTAK">Kotak Mahindra Bank</option>
                        <option value="YES">Yes Bank</option>
                        <option value="IDBI">IDBI Bank</option>
                        <option value="CANARA">Canara Bank</option>
                    </select>
                </div>
                <p class="pay-input-hint">You will be redirected to your bank's secure payment page</p>
            </div>`;
        btn.disabled = true;
        document.getElementById('bankSelect').addEventListener('change', validatePaymentForm);
    } else if (method === 'CASH') {
        area.innerHTML = `
            <div class="pay-input-section">
                <div class="cash-info-box">
                    <span class="material-symbols-rounded">storefront</span>
                    <div>
                        <strong>Pay at the rental shop</strong>
                        <p>Pay ₹${currentPaymentBookingData.totalPrice} in cash when you pick up the vehicle from <strong>${currentPaymentBookingData.shopName}</strong>.</p>
                    </div>
                </div>
            </div>`;
        btn.disabled = false;
    }
}

function validatePaymentForm() {
    const btn = document.getElementById('confirmPayBtn');
    let valid = false;

    if (selectedPaymentMethod === 'UPI') {
        const upi = document.getElementById('upiIdInput').value.trim();
        valid = /^[\w.\-]+@[\w]+$/.test(upi);
    } else if (selectedPaymentMethod === 'CREDIT_CARD') {
        const num = (document.getElementById('cardNumberInput').value || '').replace(/\s/g, '');
        const exp = document.getElementById('cardExpiryInput').value || '';
        const cvv = document.getElementById('cardCvvInput').value || '';
        const name = (document.getElementById('cardNameInput').value || '').trim();
        valid = num.length === 16 && /^\d{2}\/\d{2}$/.test(exp) && cvv.length === 3 && name.length >= 2;
    } else if (selectedPaymentMethod === 'NET_BANKING') {
        valid = document.getElementById('bankSelect').value !== '';
    }

    btn.disabled = !valid;
}

function getPayerInfo() {
    if (selectedPaymentMethod === 'UPI') {
        return document.getElementById('upiIdInput').value.trim();
    } else if (selectedPaymentMethod === 'CREDIT_CARD') {
        const num = document.getElementById('cardNumberInput').value.replace(/\s/g, '');
        return 'Card ending ' + num.slice(-4);
    } else if (selectedPaymentMethod === 'NET_BANKING') {
        return document.getElementById('bankSelect').options[document.getElementById('bankSelect').selectedIndex].text;
    } else if (selectedPaymentMethod === 'CASH') {
        return 'Cash on Delivery';
    }
    return '';
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.remove();
    selectedPaymentMethod = null;
}

async function processPayment(bookingId) {
    if (!selectedPaymentMethod) {
        alert('Please select a payment method');
        return;
    }

    const btn = document.getElementById('confirmPayBtn');
    btn.classList.add('processing');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-rounded">hourglass_top</span> Processing...';

    try {
        const token = localStorage.getItem('token');
        const payerInfo = getPayerInfo();
        const result = await apiCall(`/api/customer/bookings/${bookingId}/payment`, 'POST', {
            paymentMethod: selectedPaymentMethod,
            payerInfo: payerInfo
        }, token);

        btn.innerHTML = '<span class="material-symbols-rounded">check_circle</span> Payment Successful!';
        btn.classList.remove('processing');
        btn.style.background = '#059669';

        // Show receipt after a brief success flash
        setTimeout(() => {
            closePaymentModal();
            showReceipt(result, currentPaymentBookingData, payerInfo);
        }, 800);
    } catch (error) {
        btn.classList.remove('processing');
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-rounded">lock</span> Retry Payment';
        alert('Payment failed: ' + error.message);
    }
}

// ───────── RECEIPT FUNCTIONS ─────────

function showReceipt(payment, bookingData, payerInfo) {
    const existing = document.getElementById('receiptModal');
    if (existing) existing.remove();

    const methodLabels = {
        'UPI': 'UPI',
        'CREDIT_CARD': 'Credit / Debit Card',
        'NET_BANKING': 'Net Banking',
        'CASH': 'Cash on Delivery'
    };

    const payDate = payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : new Date().toLocaleString();
    const methodLabel = methodLabels[payment.paymentMethod] || payment.paymentMethod;

    const modal = document.createElement('div');
    modal.id = 'receiptModal';
    modal.className = 'payment-modal-overlay';
    modal.innerHTML = `
        <div class="receipt-modal">
            <div class="receipt-header">
                <div class="receipt-success-icon">
                    <span class="material-symbols-rounded">check_circle</span>
                </div>
                <h3>Payment Successful!</h3>
                <p class="receipt-amount">₹${payment.amount}</p>
            </div>
            <div class="receipt-body">
                <div class="receipt-txn-id">
                    <span>Transaction ID</span>
                    <strong>${payment.transactionId}</strong>
                </div>
                <div class="receipt-details">
                    <div class="receipt-row">
                        <span class="material-symbols-rounded">directions_car</span>
                        <div class="receipt-row-info">
                            <span class="receipt-label">Vehicle</span>
                            <span class="receipt-value">${bookingData.vehicleName}</span>
                        </div>
                    </div>
                    <div class="receipt-row">
                        <span class="material-symbols-rounded">storefront</span>
                        <div class="receipt-row-info">
                            <span class="receipt-label">Shop</span>
                            <span class="receipt-value">${bookingData.shopName}</span>
                        </div>
                    </div>
                    <div class="receipt-row">
                        <span class="material-symbols-rounded">schedule</span>
                        <div class="receipt-row-info">
                            <span class="receipt-label">Duration</span>
                            <span class="receipt-value">${bookingData.totalHours} hours</span>
                        </div>
                    </div>
                    <div class="receipt-row">
                        <span class="material-symbols-rounded">payment</span>
                        <div class="receipt-row-info">
                            <span class="receipt-label">Payment Method</span>
                            <span class="receipt-value">${methodLabel}</span>
                        </div>
                    </div>
                    <div class="receipt-row">
                        <span class="material-symbols-rounded">account_circle</span>
                        <div class="receipt-row-info">
                            <span class="receipt-label">Paid Via</span>
                            <span class="receipt-value">${payerInfo}</span>
                        </div>
                    </div>
                    <div class="receipt-row">
                        <span class="material-symbols-rounded">calendar_today</span>
                        <div class="receipt-row-info">
                            <span class="receipt-label">Date & Time</span>
                            <span class="receipt-value">${payDate}</span>
                        </div>
                    </div>
                    <div class="receipt-row receipt-total-row">
                        <span class="material-symbols-rounded">paid</span>
                        <div class="receipt-row-info">
                            <span class="receipt-label">Amount Paid</span>
                            <span class="receipt-value receipt-total">₹${payment.amount}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="receipt-footer">
                <button class="pay-btn pay-btn-confirm" onclick="printReceipt()">
                    <span class="material-symbols-rounded">print</span> Print Receipt
                </button>
                <button class="pay-btn pay-btn-cancel" onclick="closeReceipt()">
                    <span class="material-symbols-rounded">close</span> Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeReceipt();
    });
}

// View receipt for already-paid bookings
async function viewReceipt(bookingId) {
    try {
        const token = localStorage.getItem('token');
        const payment = await apiCall(`/api/customer/bookings/${bookingId}/payment`, 'GET', null, token);
        const booking = await apiCall(`/api/customer/bookings/${bookingId}`, 'GET', null, token);

        showReceipt(payment, {
            vehicleName: booking.vehicleName,
            shopName: booking.shopName,
            totalHours: booking.totalHours,
            totalPrice: booking.totalPrice
        }, payment.payerInfo || payment.paymentMethod);
    } catch (error) {
        alert('Failed to load receipt: ' + error.message);
    }
}

function closeReceipt() {
    const modal = document.getElementById('receiptModal');
    if (modal) modal.remove();
    loadMyBookings();
}

function printReceipt() {
    const receiptEl = document.querySelector('.receipt-modal');
    if (!receiptEl) return;
    const printWin = window.open('', '_blank', 'width=420,height=600');
    printWin.document.write(`
        <html><head><title>Payment Receipt</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family:'Inter',sans-serif; padding:2rem; color:#1e293b; }
            .r-head { text-align:center; margin-bottom:1.5rem; }
            .r-head h2 { font-size:1.3rem; color:#059669; margin-bottom:.25rem; }
            .r-head .amt { font-size:2rem; font-weight:800; }
            .r-txn { text-align:center; background:#f1f5f9; padding:.6rem; border-radius:8px; margin-bottom:1.25rem; font-size:.85rem; }
            .r-txn strong { display:block; font-size:.95rem; letter-spacing:.5px; }
            .r-rows { border-top:1px solid #e2e8f0; }
            .r-row { display:flex; justify-content:space-between; padding:.6rem 0; border-bottom:1px solid #f1f5f9; font-size:.88rem; }
            .r-row .lbl { color:#64748b; }
            .r-row .val { font-weight:600; text-align:right; }
            .r-total .val { font-size:1.1rem; color:#059669; }
            .r-foot { text-align:center; margin-top:1.5rem; font-size:.75rem; color:#94a3b8; }
        </style></head><body>
        <div class="r-head">
            <h2>✓ Payment Successful</h2>
            <div class="amt">₹${receiptEl.querySelector('.receipt-amount').textContent.replace('₹','')}</div>
        </div>
        <div class="r-txn">Transaction ID<br><strong>${receiptEl.querySelector('.receipt-txn-id strong').textContent}</strong></div>
        <div class="r-rows">
            ${Array.from(receiptEl.querySelectorAll('.receipt-row')).map(row => {
                const label = row.querySelector('.receipt-label').textContent;
                const value = row.querySelector('.receipt-value').textContent;
                return '<div class="r-row' + (row.classList.contains('receipt-total-row') ? ' r-total' : '') + '"><span class="lbl">' + label + '</span><span class="val">' + value + '</span></div>';
            }).join('')}
        </div>
        <div class="r-foot">Vehicle Rental Platform &bull; Thank you for your payment</div>
        </body></html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); }, 300);
}
