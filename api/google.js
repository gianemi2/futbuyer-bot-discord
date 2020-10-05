const { google } = require('googleapis')
const fetch = require('node-fetch')
require('dotenv').config()

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URIS, GOOGLE_CODE, GOOGLE_ACCESS_TOKEN } = process.env;
const GROUPKEY = 'futbuyer@develovers.site';

const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URIS
)

const scopes = [
    'https://www.googleapis.com/auth/admin.directory.group.member',
    'https://www.googleapis.com/auth/admin.directory.group',
    'https://www.googleapis.com/auth/admin.directory.group.member.readonly',
    'https://www.googleapis.com/auth/admin.directory.group.readonly'
]

const googleSignTokens = async () => {
    const { tokens } = await oauth2Client.getToken(GOOGLE_CODE);
    console.log(tokens)
    return tokens
}
//googleSignTokens()

const createUserInGroups = async (email) => {
    const response = await fetch(`https://www.googleapis.com/admin/directory/v1/groups/${GROUPKEY}/members`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GOOGLE_ACCESS_TOKEN}`
        },
        body: JSON.stringify({ email })
    })
    const json = await response.json();
    return json;
}

const removeUserFromGroup = async (email) => {
    const response = await fetch(`https://www.googleapis.com/admin/directory/v1/groups/${GROUPKEY}/members/${email}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${GOOGLE_ACCESS_TOKEN}`
        }
    })
    const json = await response.json();
    return json;
}

module.exports = {
    generateToken: oauth2Client.generateAuthUrl({ scope: scopes }),
    createUserInGroups,
    removeUserFromGroup
}