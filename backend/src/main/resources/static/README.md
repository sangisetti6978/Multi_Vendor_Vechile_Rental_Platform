# Vehicle Rental Platform - Frontend

Modern, responsive frontend for the Multi-Vendor Vehicle Rental Booking Platform built with HTML5, CSS3, and vanilla JavaScript.

## 🎨 Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Vanilla JS with async/await
- **No Framework**: Lightweight and fast
- **LocalStorage**: JWT token management

## 📁 Project Structure

```
frontend/
├── css/
│   ├── style.css           # Main styles
│   ├── dashboard.css       # Dashboard-specific styles
│   └── responsive.css      # Mobile responsiveness
├── js/
│   ├── api.js             # API wrapper and fetch utilities
│   ├── auth.js            # Authentication guards
│   ├── customer.js        # Customer dashboard logic
│   ├── owner.js           # Owner dashboard logic
│   ├── admin.js           # Admin dashboard logic
│   └── utils.js           # Utility functions
├── index.html             # Landing page
├── login.html             # Login page
├── register.html          # Registration page
├── customer-dashboard.html # Customer dashboard
├── owner-dashboard.html    # Owner dashboard
├── admin-dashboard.html    # Admin dashboard
├── vehicle-search.html     # Vehicle search page
└── vehicle-details.html    # Vehicle details page
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Backend API running on `http://localhost:8080`

### Option 1: Python HTTP Server
```bash
cd frontend
python -m http.server 8000
```
Access at: `http://localhost:8000`

### Option 2: Node.js HTTP Server
```bash
cd frontend
npx serve .
```

### Option 3: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## 🔧 Configuration

### API Base URL
Update in `js/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

For production, change to your deployed backend URL:
```javascript
const API_BASE_URL = 'https://your-api-domain.com/api';
```

## 📱 Pages Overview

### 1. Landing Page (`index.html`)
- Hero section with call-to-action
- Featured vehicles showcase
- How it works section
- Platform statistics
- Footer with links

### 2. Authentication Pages
- **Login** (`login.html`): Email/password authentication
- **Register** (`register.html`): User registration with role selection (Customer/Owner)

### 3. Customer Dashboard (`customer-dashboard.html`)
Features:
- View all bookings with status
- Cancel pending bookings
- Track booking history
- Submit reviews for completed bookings
- Quick stats (total bookings, active rentals)

### 4. Owner Dashboard (`owner-dashboard.html`)
Features:
- Create and manage shops
- Add/edit/delete vehicles
- Set pricing and availability
- Accept/reject booking requests
- Complete bookings
- View booking statistics
- Upload vehicle images

### 5. Admin Dashboard (`admin-dashboard.html`)
Features:
- User management (verify, deactivate, delete)
- Shop management (review, delete)
- Vehicle management (remove listings)
- Platform monitoring
- Activity statistics

### 6. Vehicle Pages
- **Search** (`vehicle-search.html`): Filter by location, type, brand, price
- **Details** (`vehicle-details.html`): View details, reviews, and book vehicle

## 🎯 Key Features

### Authentication System
```javascript
// Check if user is logged in
if (!isAuthenticated()) {
    window.location.href = '/login.html';
}

// Get current user details
const user = getUser();

// Role-based access
requireAuth(['OWNER']); // Redirect if not owner
```

### API Integration
```javascript
// All API calls automatically include JWT token
const vehicles = await apiCall('/customer/vehicles/search', {
    method: 'POST',
    body: JSON.stringify(searchData)
});
```

### Dynamic Content Rendering
```javascript
// Customer bookings
function loadMyBookings() {
    const bookings = await apiCall('/customer/bookings');
    renderBookingsTable(bookings);
}

// Owner vehicles
function loadMyVehicles(shopId) {
    const vehicles = await apiCall(`/owner/shops/${shopId}/vehicles`);
    renderVehicleCards(vehicles);
}
```

## 🔒 Security Features

### JWT Token Management
- Tokens stored in localStorage
- Automatically included in API requests
- Auto-logout on token expiration
- Secure role-based redirects

### Form Validation
```javascript
// Email validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Phone validation
function isValidPhone(phone) {
    const re = /^\+?[\d\s-()]+$/;
    return re.test(phone);
}
```

### XSS Protection
- All user input sanitized
- No `innerHTML` with user data
- Use `textContent` for dynamic text

## 🎨 Styling System

### CSS Architecture
1. **style.css**: Base styles, typography, components
2. **dashboard.css**: Dashboard layouts, cards, tables
3. **responsive.css**: Media queries for mobile/tablet

### Color Scheme
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #1e40af;
    --success-color: #10b981;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --text-dark: #1f2937;
    --text-light: #6b7280;
    --bg-light: #f9fafb;
    --border-color: #e5e7eb;
}
```

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

## 📊 JavaScript Modules

### api.js
API client with authentication:
```javascript
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            ...options.headers
        }
    });
    return response.json();
}
```

### auth.js
Authentication utilities:
```javascript
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

function getUser() {
    return JSON.parse(localStorage.getItem('user'));
}

function requireAuth(roles = []) {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    const user = getUser();
    if (roles.length > 0 && !roles.includes(user.role)) {
        showAlert('Access denied', 'error');
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}
```

### utils.js
Utility functions:
```javascript
// Date formatting
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Currency formatting
function formatCurrency(amount) {
    return `₹${parseFloat(amount).toFixed(2)}`;
}

// Status badge
function getStatusBadge(status) {
    const colors = {
        PENDING: 'warning',
        ACCEPTED: 'info',
        COMPLETED: 'success',
        CANCELLED: 'danger'
    };
    return `<span class="badge badge-${colors[status]}">${status}</span>`;
}
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Registration with all roles
- [ ] Login and logout
- [ ] Role-based access control
- [ ] Customer: Search, book, cancel, review
- [ ] Owner: Create shop, add vehicle, accept/reject booking
- [ ] Admin: Verify user, delete shop/vehicle
- [ ] Responsive design on mobile
- [ ] Form validation
- [ ] Error handling

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🚀 Production Deployment

### Netlify Deployment
1. Create `netlify.toml`:
```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Deploy:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=.
```

### Vercel Deployment
```bash
npm install -g vercel
vercel --prod
```

### Update API URL
Before deployment, update `js/api.js`:
```javascript
const API_BASE_URL = 'https://your-backend.herokuapp.com/api';
```

### Enable CORS
Ensure backend allows your frontend domain:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.addAllowedOrigin("https://your-frontend.netlify.app");
    // ...
}
```

## 🐛 Troubleshooting

### API Connection Failed
- Verify backend is running
- Check `API_BASE_URL` in `api.js`
- Check browser console for errors
- Verify CORS configuration

### Login Issues
- Check credentials
- Verify JWT token format
- Clear localStorage and retry
- Check backend authentication logs

### Page Not Loading
- Check browser console for errors
- Verify all JS files are loaded
- Check network tab for failed requests

## ♿ Accessibility

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Sufficient color contrast
- Focus indicators

## 📈 Performance Optimization

- Minify CSS and JavaScript for production
- Lazy load images
- Use CDN for static assets
- Enable browser caching
- Compress responses (gzip)

## 🔄 Future Enhancements

- [ ] Progressive Web App (PWA)
- [ ] Real-time notifications (WebSockets)
- [ ] Image compression and optimization
- [ ] Infinite scroll for vehicle listings
- [ ] Advanced filters with URL parameters
- [ ] Dark mode support
- [ ] Multi-language support

## 📚 Resources

- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)
- [CSS Tricks](https://css-tricks.com/)
- [Can I Use](https://caniuse.com/)

---

**For backend documentation, see: `../backend/README.md`**
