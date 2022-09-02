require('dotenv').config({ path: `.env` })

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PROTOCOL: process.env.PROTOCOL || 'http',
    HOST: process.env.HOST || 'localhost',
    PORT: process.env.PORT || 80,
    ID: process.env.CLIENT_ID || '',
    SECRET: process.env.SECRET_ID || ''
}
