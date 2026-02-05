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
app.get('/', (req, res) => res.send('Utility API is Online.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
