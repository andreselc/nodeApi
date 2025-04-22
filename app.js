require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path'); 
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');


const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const { ServerResponse } = require('http');

const MONGODB_URI = process.env.DB_HOST;

const app = express();
app.use('/images', express.static(path.join(__dirname, 'images')));

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        const extension = path.extname(file.originalname);
        cb(null, uuidv4() + extension); 
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({ storage: storage, fileFilter: fileFilter }).single('image'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message, data: error.data });
});

mongoose.connect(MONGODB_URI)
    .then(result => {
        const server = app.listen(8080);
        const io = require('./socket').init(server);

        io.on('connection', socket => {
            console.log('Client connected!');
            socket.on('disconnect', () => {
                console.log('Client disconnected!');
            });
        });
    })
    .catch(err => {
        console.log(err);
    });
