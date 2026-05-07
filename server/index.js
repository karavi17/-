const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const compression = require('compression');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 1e8, // 100MB buffer for large movie data
    pingTimeout: 60000
});

// Optimization for large data
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const pendingRequests = new Map();

io.on('connection', (socket) => {
    console.log('🕊️ Kabuterji Agent Connected:', socket.id);

    // Jab agent response wapas bheje (Supports large data)
    socket.on('backend-response', (data) => {
        const { requestId, status, body, headers } = data;
        const res = pendingRequests.get(requestId);

        if (res) {
            console.log(`✅ Response delivered for ${requestId}`);
            
            // Set headers from backend
            if (headers) {
                Object.keys(headers).forEach(key => {
                    res.setHeader(key, headers[key]);
                });
            }

            res.status(status || 200).send(body);
            pendingRequests.delete(requestId);
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ Kabuterji Agent Offline');
    });
});

// Main Relay Endpoint
app.use((req, res) => {
    const requestId = uuidv4();
    
    const requestData = {
        requestId,
        method: req.method,
        path: req.url, // Includes query params
        headers: req.headers,
        body: req.body
    };

    console.log(`📩 Forwarding: ${req.method} ${req.url}`);

    // Send to connected agent
    io.emit('frontend-request', requestData);

    pendingRequests.set(requestId, res);
    
    // Timeout extended for large movie API calls (60s)
    setTimeout(() => {
        if (pendingRequests.has(requestId)) {
            pendingRequests.delete(requestId);
            res.status(504).send('Kabuterji Timeout: Local agent is taking too long to respond.');
        }
    }, 60000);
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`
    🕊️  KABUTERJI RELAY SERVER  🕊️
    ----------------------------
    Status: Running
    Port: ${PORT}
    Frontend URL: http://localhost:${PORT}
    ----------------------------
    `);
});
