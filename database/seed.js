const { db, Book } = require('./setup');

// Sample book data
const sampleBooks = [
    {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0-7432-7356-5",
        genre: "Fiction",
        publishedYear: 1925,
        available: true
    },
    {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "978-0-06-112008-4",
        genre: "Fiction",
        publishedYear: 1960,
        available: false
    },
    {
        title: "1984",
        author: "George Orwell",
        isbn: "978-0-452-28423-4",
        genre: "Dystopian Fiction",
        publishedYear: 1949,
        available: true
    },
    {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        isbn: "978-0-14-143951-8",
        genre: "Romance",
        publishedYear: 1813,
        available: true
    },
    {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        isbn: "978-0-316-76948-0",
        genre: "Fiction",
        publishedYear: 1951,
        available: false
    },
    {
        title: "Lord of the Flies",
        author: "William Golding",
        isbn: "978-0-571-05686-2",
        genre: "Fiction",
        publishedYear: 1954,
        available: true
    },
    {
        title: "Animal Farm",
        author: "George Orwell",
        isbn: "978-0-452-28424-1",
        genre: "Political Fiction",
        publishedYear: 1945,
        available: true
    },
    {
        title: "Brave New World",
        author: "Aldous Huxley",
        isbn: "978-0-06-085052-4",
        genre: "Science Fiction",
        publishedYear: 1932,
        available: false
    },
    {
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        isbn: "978-0-544-00341-5",
        genre: "Fantasy",
        publishedYear: 1954,
        available: true
    },
    {
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
        isbn: "978-0-439-70818-8",
        genre: "Fantasy",
        publishedYear: 1997,
        available: true
    }
];

// Sample users
const sampleUsers = [
    {
        name: "John Smith",
        email: "john.smith@email.com",
        membershipDate: new Date('2023-01-15'),
        isActive: true
    },
    {
        name: "Jane Doe",
        email: "jane.doe@email.com",
        membershipDate: new Date('2023-03-20'),
        isActive: true
    },
    {
        name: "Bob Johnson",
        email: "bob.johnson@email.com",
        membershipDate: new Date('2023-05-10'),
        isActive: true
    }
];

// Sample checkouts
const sampleCheckouts = [
    {
        userId: 1,
        bookId: 1,
        checkoutDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-15'),
        isReturned: false
    },
    {
        userId: 1,
        bookId: 3,
        checkoutDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-20'),
        returnDate: new Date('2024-02-10'),
        isReturned: true
    },
    {
        userId: 2,
        bookId: 5,
        checkoutDate: new Date('2024-01-22'),
        dueDate: new Date('2024-02-22'),
        isReturned: false
    }
];


// Seed database with sample data
async function seedDatabase() {
    try {
        await db.authenticate();
        console.log('Connected to database for seeding.');
        
        // Try to seed users if User model exists
        try {
            const { User } = require('./setup');
            
            await User.bulkCreate(sampleUsers);
            console.log('Sample users inserted successfully.');
        } catch (error) {
            console.log('User model not found - skipping user seeding');
        }

        // Insert sample books
        await Book.bulkCreate(sampleBooks);
        console.log('Sample books inserted successfully.');

        // Try to seed users if Checkouts model exists
        try {
            const { Checkout } = require('./setup');
            
            await Checkout.bulkCreate(sampleCheckouts);
            console.log('Sample checkouts inserted successfully.');
        } catch (error) {
            console.log('Checkout model not found - skipping user seeding');
        }
                
        await db.close();
        console.log('Database seeding completed.');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seedDatabase();