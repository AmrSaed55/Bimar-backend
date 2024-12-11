const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Configure these values
const SECRET = 'your-webhook-secret';  // Set this in your repository webhook settings
const REPO_PATH = 'C:\\Users\\Administrator\\Desktop\\Bimar\\Bimar-backend';
const PORT = 3001;  // Changed to different port
const MAIN_APP_NAME = 'your-main-app-name-in-pm2';  // Replace with your main app's PM2 name

app.post('/webhook', (req, res) => {
    const signature = req.headers['x-hub-signature'];
    const hmac = crypto.createHmac('sha1', SECRET);
    const digest = 'sha1=' + hmac.update(JSON.stringify(req.body)).digest('hex');
    
    if (signature === digest) {
        exec('cd /d ' + REPO_PATH + ' && git pull && pm2 reload ' + MAIN_APP_NAME, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error}`);
                return res.status(500).send(error);
            }
            console.log(`Deployment successful: ${stdout}`);
            res.status(200).send('Application updated and reloaded successfully');
        });
    } else {
        res.status(403).send('Invalid signature');
    }
});

app.listen(PORT, () => {
    console.log(`Webhook server listening on port ${PORT}`);
});
