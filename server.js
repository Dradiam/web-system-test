    
    const express = require('express');
    const bodyParser = require('body-parser');
    const mysql = require('mysql2');
    const crypto = require('crypto');
    const path = require('path');

    const app = express();
    const port = 3000;

    const conn = mysql.createConnection({

        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test-db'

    });

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => {

        res.sendFile(path.join(__dirname, 'public', 'auth.html'));
        
    });

    app.post('/auth', (req, res) => {

        const { username, password } = req.body;
        const query = 'SELECT * FROM users WHERE username = ?';

        conn.execute(query, [username], (err, results) => {
            
            if (err) {

                console.error('Database query error:', err);
                return res.status(500).send('Internal server error');

            }

            if (results.length > 0) {

                const row = results[0];
                const storedHash = row.password;

                const concatInput = username + password;
                const userHash = crypto.createHash('md5').update(concatInput).digest('hex');

                if (userHash === storedHash) {

                    res.send('Login successful!');

                } else {

                    res.send('Login failed. Invalid credentials.');

                }

                // console.log('combined string:', concatInput);
                // console.log('generated hash:', userHash);
                // console.log('db hash:', storedHash);

            } else {

                res.send('Login failed. No user credentials found.');

            }
        
        });

    });

    conn.connect((err) => {

        if (err) {

            console.error('Error connecting:', err.stack);
            return;

        }

        console.log("Database connected.");

    });

    app.listen(port, () => {

        console.log('Server now running.');

    });
    
