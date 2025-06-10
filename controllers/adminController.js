const db = require('../config/db');

// Admin Login Page
exports.getAdminLogin = (req, res) => {
    res.render('admin_login', { error: null });
};

// Handle Admin Login
exports.postAdminLogin = (req, res) => {
    const { username, password } = req.body;
    const adminUsername = 'admin';
    const adminPassword = 'admin123';

    if (username === adminUsername && password === adminPassword) {
        req.session.admin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin_login', { error: 'Invalid credentials' });
    }
};

// Admin Dashboard View (User List)
exports.getDashboard = (req, res) => {
    if (!req.session.admin) return res.redirect('/admin/login');

    const db = require('../config/db');
    db.query('SELECT * FROM users', (err, result) => {
        if (err) {
            console.error(err);
            return res.send('Database error');
        }
        res.render('admin_dashboard', { users: result });
    });
};

exports.deleteUser = (req, res) => {
    if (!req.session.admin) return res.redirect('/admin/login');

    const userId = req.params.id;

    const deleteQuery = 'DELETE FROM users WHERE id = ?';
    db.query(deleteQuery, [userId], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.send('Error deleting user');
        }

        res.redirect('/admin/dashboard');
    });
};


exports.getEditUser = (req, res) => {
    if (!req.session.admin) return res.redirect('/admin/login');

    const userId = req.params.id;
    const query = 'SELECT * FROM users WHERE id = ?';

    db.query(query, [userId], (err, results) => {
        if (err || results.length === 0) {
            console.error('Fetch Error:', err);
            return res.send('User not found');
        }

        res.render('edit_user', { user: results[0] });
    });
};



exports.postEditUser = (req, res) => {
    if (!req.session.admin) return res.redirect('/admin/login');

    const userId = req.params.id;
    const { name, email, phone, password } = req.body;

    let sql, params;

    if (!password || password.trim() === '') {
        sql = 'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?';
        params = [name, email, phone, userId];
    } else {
        const bcrypt = require('bcrypt');
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Hash error:', err);
                return res.send('Error updating password');
            }

            sql = 'UPDATE users SET name = ?, email = ?, phone = ?, password = ? WHERE id = ?';
            params = [name, email, phone, hash, userId];

            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error('Update error:', err);
                    return res.send('Error updating user');
                }

                res.redirect('/admin/dashboard');
            });
        });

        return; // exit early if password is being updated
    }

    // If no password update
    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Update error:', err);
            return res.send('Error updating user');
        }

        res.redirect('/admin/dashboard');
    });
};



exports.searchUsers = (req, res) => {
    if (!req.session.admin) return res.redirect('/admin/login');

    const searchTerm = req.query.q;
    const query = `
        SELECT * FROM users 
        WHERE name LIKE ? OR email LIKE ?
    `;
    const likeTerm = `%${searchTerm}%`;

    db.query(query, [likeTerm, likeTerm], (err, results) => {
        if (err) {
            console.error('Search error:', err);
            return res.send('Error searching users');
        }

        res.render('admin_dashboard', { users: results });
    });
};




// Logout
exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
};
