const express = require('express');
const mysql2 = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'userdb',
});


const app = express();
app.use(express.json());
app.use(cors());

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(express.urlencoded({ extended: true }));

// Endpoint for user signup
app.post('/signup', async (req, res) => {
    try {
        const { firstname, lastname, username, email, password, phone } = req.body;

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = 'INSERT INTO userlogin (firstname, lastname, username, email, password, phone) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [firstname, lastname, username, email, hashedPassword, phone];

        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error signing up:', err);
                return res.status(500).json('Error signing up');
            }
            // Successful signup response
            return res.status(201).json('Signup successful');
        });
    } catch (error) {
        console.error('Error in signup:', error);
        return res.status(500).json('Internal server error');
    }
});

// Endpoint for user login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email and password presence
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const sql = 'SELECT * FROM userlogin WHERE email = ?';
        connection.query(sql, [email], async (err, data) => {
            if (err) {
                console.error('Error logging in:', err);
                return res.status(500).json({ error: 'Error logging in' });
            }

            if (data.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = data[0];
            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Here you could generate a token for the authenticated user session
            // Example: const token = generateAuthToken(user.id);

            // Successful login response
            if(match){
                console.log("Login sucessfully",data)
                
            }
            return res.status(200).json({ message: 'Login successful', user: user });
        });
    } catch (error) {
        console.error('Error in login:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});
