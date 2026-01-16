const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Body parser

// Valid Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tournaments', require('./routes/tournaments'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/members', require('./routes/members'));
app.use('/api/attendance', require('./routes/attendance'));

// Basic Route
app.get('/', (req, res) => {
    res.send('TorSoft API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
