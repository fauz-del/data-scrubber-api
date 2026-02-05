require('dotenv').config(); // Loads variables from .env
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const validator = require('validator');
const { parsePhoneNumberFromString } = require('libphonenumber-js');

const app = express();

// Security & Setup
app.use(helmet()); 
app.use(cors());
app.use(express.json());

// --- The Cleaning Logic ---
app.post('/api/v1/cleanse', (req, res) => {
    const startTime = Date.now();
    
    try {
        const { firstName, lastName, phone, email, country = 'US' } = req.body;

        // 1. Name Formatting
        const formatName = (n) => n ? n.trim().charAt(0).toUpperCase() + n.trim().slice(1).toLowerCase() : '';
        const cleanFirst = formatName(firstName);
        const cleanLast = formatName(lastName);

        // 2. Email Validation
        const cleanEmail = email ? email.trim().toLowerCase() : null;
        const isEmailValid = cleanEmail ? validator.isEmail(cleanEmail) : false;

        // 3. Phone Standardization
        const phoneParsed = parsePhoneNumberFromString(phone || '', country);
        const isPhoneValid = phoneParsed ? phoneParsed.isValid() : false;

        // 4. Professional Response
        res.status(200).json({
            success: true,
            meta: {
                processing_ms: Date.now() - startTime,
                version: "1.0.0"
            },
            data: {
                identity: {
                    firstName: cleanFirst,
                    lastName: cleanLast,
                    fullName: `${cleanFirst} ${cleanLast}`.trim()
                },
                contact: {
                    email: cleanEmail,
                    isEmailValid: isEmailValid,
                    phoneInternational: isPhoneValid ? phoneParsed.formatInternational() : phone,
                    isPhoneValid: isPhoneValid,
                    countryDetected: phoneParsed ? phoneParsed.country : country
                }
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Health Check for Hosting
// Health Check & Landing Page with Live Indicator
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invisible API | Status</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            @keyframes pulse-green {
                0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
            }
            .animate-pulse-green {
                animation: pulse-green 2s infinite;
            }
        </style>
    </head>
    <body class="bg-slate-950 text-slate-200 font-sans flex items-center justify-center min-h-screen">
        <div class="max-w-md w-full p-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
            <div class="flex items-center justify-between mb-8">
                <div class="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <!-- THE LIVE INDICATOR -->
                <div class="flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    <div class="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse-green"></div>
                    <span class="text-xs font-bold uppercase tracking-wider text-green-400">System Live</span>
                </div>
            </div>

            <h1 class="text-2xl font-bold text-white mb-2">Invisible API</h1>
            <p class="text-slate-400 mb-6 leading-relaxed">Enterprise-grade data cleaning and standardization engine.</p>
            
            <div class="space-y-3 mb-8 text-sm">
                <div class="flex justify-between py-2 border-b border-slate-800">
                    <span class="text-slate-500">Endpoint</span>
                    <span class="font-mono text-blue-400">/api/v1/cleanse</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-800">
                    <span class="text-slate-500">Version</span>
                    <span class="text-slate-300">1.0.0</span>
                </div>
                <div class="flex justify-between py-2">
                    <span class="text-slate-500">Environment</span>
                    <span class="text-slate-300">Production</span>
                </div>
            </div>

            <a href="https://rapidapi.com" class="block w-full py-3 bg-white text-black font-bold rounded-xl text-center hover:bg-slate-200 transition-colors shadow-lg">
                View Documentation
            </a>
        </div>
    </body>
    </html>
    `);
});

// Change this:
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

