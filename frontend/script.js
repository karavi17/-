const relayUrlInput = document.getElementById('relayUrl');
const getHelloBtn = document.getElementById('getHelloBtn');
const postDataBtn = document.getElementById('postDataBtn');
const responseOutput = document.getElementById('responseOutput');
const statusIndicator = document.getElementById('statusIndicator');

async function makeRequest(path, method = 'GET', body = null) {
    const baseUrl = relayUrlInput.value.trim();
    if (!baseUrl) {
        alert('Please enter Relay Server URL');
        return;
    }

    const url = `${baseUrl}${path}`;
    statusIndicator.innerText = `Status: Sending ${method} to ${path}...`;
    responseOutput.innerText = 'Loading...';

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
        const data = await response.json();

        statusIndicator.innerText = `Status: Success (${response.status})`;
        responseOutput.innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        statusIndicator.innerText = `Status: Error!`;
        responseOutput.innerText = `Error: ${error.message}\n\nMake sure the Relay Server is running and accessible.`;
    }
}

getHelloBtn.addEventListener('click', () => {
    makeRequest('/hello');
});

postDataBtn.addEventListener('click', () => {
    makeRequest('/data', 'POST', {
        name: 'Kabuterji User',
        message: 'Hello from Frontend!'
    });
});
