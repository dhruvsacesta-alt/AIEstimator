require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/database');
const routes = require('./routes/index');
const userController = require('./controllers/userController');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static files for uploads
app.use('/src/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'up', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
    res.send('AI Estimator API is running...');
});

// Routes
app.use('/api', routes);

// Error handling middleware (Centralized)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500
        }
    });
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    // Seed admin user
    await userController.seedAdmin();
});
