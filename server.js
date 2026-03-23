const express = require('express');
const { db, Book, User, Checkout } = require('./database/setup');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Express Session
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {  
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        req.user = {
            id: req.session.userId,
            name: req.session.userName,
            email: req.session.userEmail
        };
        next();
    } else {
        res.status(401).json({ 
            error: 'Authentication required. Please log in.' 
        });
    }
}

// Test database connection
async function testConnection() {
    try {
        await db.authenticate();
        console.log('Connection to database established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();

// BOOK ROUTES

// GET /api/books - Get all books
app.get('/api/books', requireAuth, async (req, res) => {
    try {
        const books = await Book.findAll();
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// GET /api/books/:id - Get book by ID
app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        res.json(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ error: 'Failed to fetch book' });
    }
});

// POST /api/books - Create new book
app.post('/api/books', async (req, res) => {
    try {
        const { title, author, isbn, genre, publishedYear, available } = req.body;
        
        const newBook = await Book.create({
            title,
            author,
            isbn,
            genre,
            publishedYear,
            available
        });
        
        res.status(201).json(newBook);
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ error: 'Failed to create book' });
    }
});

// PUT /api/books/:id - Update existing book
app.put('/api/books/:id', async (req, res) => {
    try {
        const { title, author, isbn, genre, publishedYear, available } = req.body;
        
        const [updatedRowsCount] = await Book.update(
        { title, author, isbn, genre, publishedYear, available },
        { where: { id: req.params.id } }
        );
        
        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        const updatedBook = await Book.findByPk(req.params.id);
        res.json(updatedBook);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: 'Failed to update book' });
    }
});

// DELETE /api/books/:id - Delete book
app.delete('/api/books/:id', async (req, res) => {
    try {
        const deletedRowsCount = await Book.destroy({
        where: { id: req.params.id }
        });
        
        if (deletedRowsCount === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

// Register, login, and logout functionality

// POST /api/register - Register new library patron
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user with this email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        
        // Hash the password before storing it
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create new user with hashed password
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword  // Store the hash, not the original password
        });
        
        // Return success (don't send back the password)
        res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }
        });
        
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// POST /api/login - User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        console.log(user.password)
        // Compare provided password with hashed password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create session if password is correct
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        
        // Password is correct - user is authenticated
        res.json({
        message: 'Login successful',
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
        });
        
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            console.error('Error destroying the session', err);
            return res.status(500).json({ error: 'Failed to logout' })
        }

        res.json({ message: "Logout successful" })
    })
})

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});