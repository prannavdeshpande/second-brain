const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
const connectDB = require('./config/db');

dotenv.config();

// Passport config
require('./config/passport')(passport);

connectDB();

const app = express();

// Stripe webhook needs raw body
app.post('/api/billing/webhook', express.raw({type: 'application/json'}));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());

// API Routes
app.get('/', (req, res) => res.json({ message: 'Welcome to Second Brain API v2' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/content', require('./routes/content'));
app.use('/api/search', require('./routes/search'));
app.use('/api/user', require('./routes/user'));
app.use('/api/billing', require('./routes/billing')); // New

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));