require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

app.post('/schedule-email', (req, res) => {
    const { to, subject, html, scheduledAt } = req.body;

    if (!to || !subject || !html || !scheduledAt) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    const delay = new Date(scheduledAt) - Date.now();
    if (delay < 0) {
        return res.status(400).json({ error: 'Scheduled time must be in the future.' });
    }

    setTimeout(() => {
        transporter.sendMail({
            from: process.env.GMAIL_USER,
            to,
            subject,
            html,
        }, (error, info) => {
            if (error) {
                console.error('Send Mail Error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    }, delay);

    res.json({ success: true, message: 'Email scheduled successfully.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
