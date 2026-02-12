const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userStore = require('../data/userStore');

const login = async (req, res) => {

    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const { email, password } = req.body;
    const user = await userStore.findUser(email);


    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token });
};

const register = async (req, res) => {

    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const { email, password } = req.body;
    const existingUser = await userStore.findUser(email);

    if (existingUser) {
        return res.status(400).json({success: false, message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await userStore.createUser(email, passwordHash);
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ success: true, token });
};


module.exports = {
    login,
    register
};