const express = require('express');
const webpush = require('web-push');
const router = express.Router();

const publicVapidKey = 'BG8l2QAC-tH8DSO9IBkMU2mHu5EOvrQbROKJLKDadgzojc-cpWFaO5v9Yu9UFaTIi3EJGqdyMYgbKDYfdecswKo';
const privateVapidKey = 'z0STt9tAkJzky044rUq37LO8CpwhcUqQ8OquZEZjD70';

router.post('/', async(req, res) => {
    const subscription = req.body;
    console.log('subscription', subscription);
    res.status(201).json({ message: 'subscription received'});

    webpush.setVapidDetails('mailto:anthea.meier@htw-berlin.de', publicVapidKey, privateVapidKey);
});

module.exports = router;