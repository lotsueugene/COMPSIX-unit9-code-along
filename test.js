const { db, Book, User, Checkout } = require('./database/setup'); 
const bcrypt = require('bcryptjs')

async function getData(checkoutId) {
    const checkoutData = await Checkout.findByPk(checkoutId)
    const bookData = await Book.findByPk(checkoutData.bookId)
    const userData = await User.findByPk(checkoutData.userId)
    console.log(`${userData.name} has checked out ${bookData.title} and it is due on ${checkoutData.dueDate}`)
}

// getData(1)

async function hashPassword(password, salt) {
    const hashed = await bcrypt.hash(password, salt);
    console.log(password, hashed);
    return hashed
}

async function decrypt(password, hashed) {
    const isValid = await bcrypt.compare(password, hashed);
    console.log("Password is valid?", isValid)
    return isValid
}

async function run(password, salt) {
    const hashed = await hashPassword(password , salt)
    await decrypt("password123", hashed)
}