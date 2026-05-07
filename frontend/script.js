const responseOutput = document.getElementById('responseOutput');
const statusIndicator = document.getElementById('statusIndicator');

// --- KABUTERJI CONFIGURATION ---
// Yeh aapka Railway URL hai jo ab lifetime bridge ka kaam karega
const KABUTERJI_RELAY_URL = 'https://perfect-cooperation-production-824e.up.railway.app';

/**
 * MovieBox API call karne ke liye function.
 * @param {string} endpoint - API endpoint (e.g., '/movies/popular')
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} body - Request body (if any)
 */
async function callMovieBox(endpoint, method = 'GET', body = null) {
    statusIndicator.innerText = `Status: Sending request to MovieBox via Kabuterji...`;
    
    // Relay URL + Endpoint
    const url = `${KABUTERJI_RELAY_URL}${endpoint}`;

    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        
        // Agar response binary data (image/video) nahi hai, toh JSON parse karein
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        statusIndicator.innerText = `Status: Success (${response.status})`;
        
        if (typeof data === 'object') {
            responseOutput.innerText = JSON.stringify(data, null, 2);
        } else {
            responseOutput.innerText = data;
        }

    } catch (error) {
        console.error('Kabuterji Error:', error);
        statusIndicator.innerText = `Status: Connection Error!`;
        responseOutput.innerText = `Error: ${error.message}\n\n1. Make sure Railway server is UP.\n2. Make sure Local Agent is running on your PC.`;
    }
}

// Example buttons setup
document.getElementById('getHelloBtn').addEventListener('click', () => {
    callMovieBox('/hello'); // Test endpoint
});

document.getElementById('postDataBtn').addEventListener('click', () => {
    callMovieBox('/data', 'POST', {
        source: 'InfinityFree',
        action: 'Test MovieBox Bridge'
    });
});
