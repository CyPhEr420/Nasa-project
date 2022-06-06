const express = require('express');
const path = require('path')
const morgan = require('morgan');
const app = express();
const cors = require('cors');

const v1 = require('./routes/v1');



app.use(cors({
    origin: 'http://localhost:3000',
}))

app.use(morgan('combined'));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/v1', v1);


app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
})




module.exports = app;