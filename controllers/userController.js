const db = require('../config/db');

exports.getSignup = (req, res) => {
    res.render('signup');
};

const bcrypt = require('bcrypt');


exports.postSignup = (req, res) => {
    const { name, email, password, phone } = req.body; // ✅ Include phone

    // Hash password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Hashing error:', err);
            return res.render('signup', { error: 'Error during signup' });
        }

        const sql = 'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)';
        db.query(sql, [name, email, hash, phone], (err, result) => {
            if (err) {
                console.error('Signup error:', err);
                return res.render('signup', { error: 'Email already registered or database error' });
            }

            res.redirect('/login');
        });
    });
};



//const db = require('../config/db');

exports.getLogin = (req, res) => {
    res.render('login', { error: null });
};

exports.postLogin = (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Login Error:', err);
            return res.render('login', { error: 'Internal server error' });
        }

        if (results.length === 1) {
            const user = results[0];

            // Compare hashed password
            bcrypt.compare(password, user.password, (err, match) => {
                if (match) {
                    req.session.user = user;
                    res.redirect('/home');
                } else {
                    res.render('login', { error: 'Invalid email or password' });
                }
            });
        } else {
            res.render('login', { error: 'Invalid email or password' });
        }
    });
};



exports.getHome = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('home', { user: req.session.user });
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout Error:', err);
        }
        res.redirect('/login');
    });
};


exports.getProfile = (req, res) => {
    const userId = req.session.user.id;

    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err || results.length === 0) {
            console.error('Fetch error:', err);
            return res.render('profile', { user: req.session.user, message: 'Error loading profile' });
        }

        const user = results[0];
        res.render('profile', { user, message: null });
    });
};





exports.postProfile = (req, res) => {
    const { name, email, phone, password } = req.body;
    const userId = req.session.user.id;

    let sql, params;

    if (!password || password.trim() === '') {
        sql = 'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?';
        params = [name, email, phone, userId];
    } else {
        // Hash the new password
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Hash error:', err);
                return res.render('profile', { user: req.session.user, message: 'Error updating password' });
            }

            const sql = 'UPDATE users SET name = ?, email = ?, phone = ?, password = ? WHERE id = ?';
            const params = [name, email, phone, hash, userId];

            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error('Update error:', err);
                    return res.render('profile', { user: req.session.user, message: 'Error updating profile' });
                }

                req.session.user.name = name;
                req.session.user.email = email;
                req.session.user.phone = phone;

                res.render('profile', { user: req.session.user, message: 'Profile updated successfully!' });
            });
        });

        return; // exit early, password handled async
    }

    // If no password update
    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Update error:', err);
            return res.render('profile', { user: req.session.user, message: 'Error updating profile' });
        }

        req.session.user.name = name;
        req.session.user.email = email;
        req.session.user.phone = phone;

        res.render('profile', { user: req.session.user, message: 'Profile updated successfully!' });
    });
};
