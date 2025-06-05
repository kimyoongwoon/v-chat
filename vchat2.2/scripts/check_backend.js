const http = require("http");

const BACKEND_URL = "http://localhost:8000";

function checkBackend() {
    return new Promise((resolve, reject) => {
        const req = http.get(`${BACKEND_URL}/api/personas`, (res) => {
            console.log(`✅ Backend is running! Status: ${res.statusCode}`);
            resolve(true);
        });

        req.on("error", (err) => {
            console.log(`❌ Backend is not running! Error: ${err.message}`);
            console.log(`💡 Please start the Python backend first:`);
            console.log(`   python backend/main.py`);
            reject(false);
        });

        req.setTimeout(5000, () => {
            console.log(`⏰ Backend connection timeout`);
            req.destroy();
            reject(false);
        });
    });
}

checkBackend().catch(() => process.exit(1));
