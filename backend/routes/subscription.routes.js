const express = require('express');
const webpush = require('web-push');
const router = express.Router();

const publicVapidKey = 'BOdbH2QnVdRiADUU_WV5jp4yLhOC-i6q9HC57vlKPb2oe5YQu1XM4ALBR-u-lrnzI39ajMZaGz8agAYtYm_yQyo';
const privateVapidKey = 'E6aT0hALVbVvuhiyz2FkSY5D4HS91JOjP7mxkf0ZuY4';

router.post('/', async(req, res) => {
    const subscription = req.body;
    console.log('subscription', subscription);
    res.status(201).json({ message: 'subscription received'});

    webpush.setVapidDetails('mailto:anthea.meier@htw-berlin.de', publicVapidKey, privateVapidKey);
});

module.exports = router;