const mongoose = require('mongoose')

const connectDB = async () => {
    const connection = await mongoose.connect(process.env.DB_CONNECTION);
    console.log(`MongoDB Connected: ${connection.connection.host}`.cyan.underline.bold);
    
}


module.exports = connectDB;