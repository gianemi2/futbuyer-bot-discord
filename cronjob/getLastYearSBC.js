require('dotenv').config()

const { HELPERURL } = process.env;
const fetch = require('node-fetch')

module.exports = () => {
    return fetch(`${HELPERURL}/v1/getLastYearTodaySbcs`)
        .then(res => res.json())
        .then(res => {
            if (!res.success) throw new Error('Chiamata non conclusa correttamente. ')
            if (res.sbcs.today || res.sbcs.future) {
                return res.sbcs
            }
        })
}