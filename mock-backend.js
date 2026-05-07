const express = require('express');
const app = express();

app.get('/hello', (req, res) => {
    res.json({ message: "Hello from Localhost!", time: new Date() });
});

app.post('/data', express.json(), (req, res) => {
    res.json({ received: req.body, status: "success" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Mock Local Backend running on http://localhost:${PORT}`);
});
