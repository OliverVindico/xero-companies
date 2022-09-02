require('dotenv').config()


const getContacts = async (xero, id, name = null) => {
    try {
        const contacts = (name) ?
            await xero.accountingApi.getContacts(id, null, `Name="${name}"`) :
            await xero.accountingApi.getContacts(id)

            console.log(contacts)
        if (contacts.length < 1) return false

        return contacts.body.contacts
    } catch (err) {
        const error = JSON.stringify(err.response.body, null, 2)
        console.log(error)
        return false;
    }
}

const addContact = async (xero, id, name, email, mobile) => {
    if (!name || !email || !mobile) return false

    const data = {
        contacts: [{
            "name": name,
            "emailAddress": email,
            "phones": [
                {
                    "phoneNumber": mobile,
                    "phoneType": "MOBILE",
                }
            ]
        }]

    }

    try {
        const response = await xero.accountingApi.createContacts(id, data, true);
        return response.body
    } catch (err) {
        const error = JSON.stringify(err.response.body, null, 2)
        console.log(error);
        return false
    }
}

module.exports = {
    getContacts,
    addContact
}