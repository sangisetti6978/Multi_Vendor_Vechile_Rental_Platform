// API Configuration
// Priority: explicit window override -> local development (localhost/file://) -> Render production
const isLocalFrontend =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:');

const API_BASE_URL =
    (typeof window !== 'undefined' && window.__API_BASE_URL__) ||
    (isLocalFrontend
        ? 'http://localhost:8888'
        : 'https://vehicle-rental-backend-460f.onrender.com');

const API_TIMEOUT_MS = 20000;

// Resolve vehicle image URL — handles server-relative paths, full URLs, and missing images
function resolveVehicleImg(url, fallbackName) {
    if (!url) return 'https://via.placeholder.com/400x220/e2e8f0/64748b?text=' + encodeURIComponent(fallbackName || 'Vehicle');
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return API_BASE_URL + url;
}

// API Call Function
async function apiCall(endpoint, method = 'GET', data = null, token = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    const config = {
        method,
        headers,
        signal: controller.signal
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            // Handle authentication/authorization failures
            if (response.status === 401 || response.status === 403) {
                // Check if this is an API call that requires auth (not login/register)
                if (!endpoint.startsWith('/api/auth/')) {
                    console.warn('Auth failed (token may be expired/invalid). Status:', response.status);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    // Delay redirect so callers can catch the error
                    setTimeout(() => { window.location.href = 'login.html'; }, 100);
                    throw new Error('Session expired. Please login again.');
                }
            }
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const error = await response.json();
                errorMessage = error.message || error.error || errorMessage;
            } catch (e) {
                try {
                    const fallbackText = await response.text();
                    if (fallbackText && fallbackText.trim()) {
                        errorMessage = fallbackText.trim();
                    }
                } catch (_) {
                    // Ignore body parsing failure and keep default error message
                }
            }
            throw new Error(errorMessage);
        }
        
        // Handle empty responses (e.g., 204 No Content or empty body)
        const text = await response.text();
        if (!text) return null;
        return JSON.parse(text);
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please make sure backend is running and try again.');
        }
        if (error.message === 'Failed to fetch') {
            console.error('Network error — is the backend running on ' + API_BASE_URL + '?');
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        }
        console.error('API call error:', error);
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { apiCall, API_BASE_URL };
}
