const express = require('express')
const colors = require('colors')
require('dotenv').config();
const { graphqlHTTP } = require('express-graphql')
const schema = require('./schema/schema')
const connectDB = require('./config/db')
const cors = require('cors')

const port = process.env.PORT || 5000;



const app = express();

// Connect DB
connectDB();

app.use('/graphql',cors(), graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === 'development'
}))



// LISTEN SERVER
app.listen(port, () => {
    console.log(`server running on port:${port}`)
})
