require('dotenv').config()

const { HELPERURL } = process.env;
const fetch = require('node-fetch')

module.exports = () => fetch(HELPERURL)
