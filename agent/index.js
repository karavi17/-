const io = require('socket.io-client');
const axios = require('axios');

// --- KABUTERJI CONFIGURATION ---
const RELAY_SERVER_URL = process.env.RELAY_URL || 'https://perfect-cooperation-production-824e.up.railway.app'; 
const LOCAL_BACKEND_URL = process.env.LOCAL_URL || 'http://localhost:6789'; 
// -------------------------------

const socket = io(RELAY_SERVER_URL, {
    maxHttpBufferSize: 1e8, // 100MB
    reconnection: true,
    reconnectionDelay: 1000
});

console.log(`
🕊️  KABUTERJI AGENT STARTING  🕊️
----------------------------
Relay: ${RELAY_SERVER_URL}
Local: ${LOCAL_BACKEND_URL}
----------------------------
`);

socket.on('connect', () => {
    console.log('✅ Connected to Kabuterji Relay!');
});

socket.on('frontend-request', async (data) => {
    const { requestId, method, path, headers, body } = data;
    
    console.log(`📥 Request: ${method} ${path}`);

    try {
        // Forward to Localhost (MovieBox API Backend)
        const response = await axios({
            method: method,
            url: `${LOCAL_BACKEND_URL}${path}`,
            headers: {
                ...headers,
                host: new URL(LOCAL_BACKEND_URL).host
            },
            data: body,
            responseType: 'arraybuffer', // Handle binary data like video chunks/images
            validateStatus: () => true
        });

        console.log(`📤 Response: ${response.status} (${response.data.length} bytes)`);

        // Send back to relay
        socket.emit('backend-response', {
            requestId,
            status: response.status,
            headers: response.headers,
            body: response.data
        });

    } catch (error) {
        console.error(`❌ Agent Error: ${error.message}`);
        socket.emit('backend-response', {
            requestId,
            status: 502,
            body: Buffer.from(JSON.stringify({ error: 'Local backend unreachable', message: error.message }))
        });
    }
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from Relay. Retrying...');
});
