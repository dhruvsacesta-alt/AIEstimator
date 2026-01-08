const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

class UserController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }



            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET || 'ai-estimator-super-secret-key',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async createSalesUser(req, res) {
        try {
            const { name, email, password } = req.body;
            console.log('Creating sales user:', { name, email });

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'All fields (name, email, password) are required' });
            }

            const existing = await User.findOne({ email });
            if (existing) {
                console.warn('User creation failed: Email already exists', email);
                return res.status(400).json({ error: 'Email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({
                name,
                email,
                password: hashedPassword,
                role: 'SALES',
                status: 'ACTIVE'
            });

            await user.save();
            console.log('Sales user created successfully:', user._id);
            res.status(201).json({ message: 'Sales user created successfully', userId: user._id });
        } catch (error) {
            console.error('Create Sales User Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async listUsers(req, res) {
        try {
            const users = await User.find({ role: 'SALES' }).select('-password');
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }



    async seedAdmin() {
        try {
            const adminEmail = 'admin@aiestimator.com';
            const existing = await User.findOne({ email: adminEmail });

            if (!existing) {
                const hashedPassword = await bcrypt.hash('admin123', 10);
                await User.create({
                    name: 'System Admin',
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'ADMIN'
                });
                console.log('Admin user seeded successfully');
            }

            const salesEmail = 'sales@aiestimator.com';
            const existingSales = await User.findOne({ email: salesEmail });
            if (!existingSales) {
                const hashedSalesPassword = await bcrypt.hash('admin123', 10);
                await User.create({
                    name: 'Default Sales',
                    email: salesEmail,
                    password: hashedSalesPassword,
                    role: 'SALES'
                });
                console.log('Sales user seeded successfully');
            }
        } catch (error) {
            console.error('Error seeding admin:', error);
        }
    }
}

module.exports = new UserController();
