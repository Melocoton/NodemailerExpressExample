const env = require('dotenv').config({path: 'config.env'});
const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();

if (env.error) { console.error(env.error); }

// Setup express config
const port = process.env.APP_PORT || 9001;
app.set('key', process.env.JWT_KEY);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '10mb'}));

// Setup authentication middleware
const protectedRoutes = express.Router();
protectedRoutes.use((req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    if (token) {
        jwt.verify(token, app.get('key'), (error, decoded) => {
            if (error) { return res.json({ msg: 'Invalid token' })}
            // Check login is set to true and token is less than two hours old
            if (decoded.login && new Date() < new Date((decoded.iat+7200)*1000)) { next(); } else { return res.json({ msg: 'Invalid token' }); }
        });
    } else {
        res.json({ msg: 'Token not provided' });
    }
});

// Conntection test endpoint
app.get('/', (req, res) => {
    console.log(`Connection test`);
    res.json('Hello');
});

app.post('/login', (req, res) => {
    if (req.body.pass === process.env.APP_PASS) {
        const token = jwt.sign({ login: true }, app.get('key'));
        res.json({
            msg: 'Login succesful',
            token: token
        });
    } else {
        res.json({ msg: 'Login failed' });
    }
});

// Authentication test endpoint
app.get('/login', protectedRoutes, (req, res) => {
    res.json({ msg: 'Login working' });
});

app.post('/mail', protectedRoutes, (req, res) => {
    // Setup email server and credentials
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    transporter.sendMail({
        from: 'admin@estomelohancambiado.com',
        to: req.body.to,
        subject: req.body.subject,
        html: req.body.body,
        attachments: req.body.attachments.map(file => {
            file.content = Buffer.from(file.content, 'base64');
            return file
        })
    }).then(() => {
        res.json('success');
    }).catch(error => {
        console.error(error);
        res.status(500).json(error);
    });

});

app.listen(port, () => {
    console.log(`App started on ${port}`);
});
