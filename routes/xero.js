require('dotenv').config()

const { default: axios } = require('axios');
const express = require('express');
const { stringToBase64 } = require('../helper');
const router = express.Router();
const qs = require('qs')
const moment = require('moment')

const { XeroClient } = require('xero-node');

function capitalize(object) { 
	var isArray = Array.isArray(object); 
	for (let key in object) { 
		let value = object[key]; 
		let newKey = key; 
		if (!isArray) { 
			delete object[key];
			newKey = key.charAt(0).toUpperCase() + key.slice(1); 
		} 
		let newValue = value; 
		if (typeof value != "object") { 
			if (typeof value == "string") { 
				newValue = value; 
			} 
		} else { 
			newValue = capitalize(value); 
		} 
		object[newKey] = newValue; 
	} 
	return object; 
}

const xero = new XeroClient({
    clientId: config.ID,
    clientSecret: config.SECRET,
    grantType: 'client_credentials'
});

let lastTokenUpdate = null
let tenantId = null

router.use("*", checkAuth)
async function checkAuth(req, res, next) {
    const dt = moment().unix()

    if (lastTokenUpdate) console.log('Time since Last Token Update (seconds)', dt - lastTokenUpdate)
    if (dt - lastTokenUpdate > 1500 || lastTokenUpdate == null) {
        lastTokenUpdate = dt

        console.log("Creating New Access Token...")
        tokenSet = await xero.getClientCredentialsToken();
        xero.setTokenSet(tokenSet)

        const tenants = await xero.updateTenants(false)
        tenantId = tenants[0].tenantId
        console.log("Access Token Created")
    }

    next()
}

router.get("/contacts", async (req, res) => {
    const { name, email, mobile } = req.body
    if (!name || !email || !mobile) return res.send("Include name, email and mobile in JSON body")
    
    try {
        let contact = null
        let contactId = null
        const contacts = await xero.accountingApi.getContacts(tenantId, null, `Name="${name}"`)

        if (contacts.body.contacts.length < 1){
            console.log(`Cannot Find Xero Contact (${name}), Creating Contact...`)

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

            // convert all keys to capitalised because createContacts API and getContacts API
            // return the same object but different structure of the keys e.g. one is capitalised, one is not
            const createContact = await xero.accountingApi.createContacts(tenantId, data);
            contact = capitalize(createContact.response.body.Contacts[0])
            console.log(`Created Xero Contact (${name})`)
        }
        

        if (!contact) contact = capitalize(contacts.body.contacts[0])
        contactId = contact.ContactID

        // get invoices for a specific contact
        let invoices = await xero.accountingApi.getInvoices(tenantId, null, `Contact.ContactID=guid("${contactId}")`)
        invoices = invoices.response.body.Invoices

        console.log(`Found Xero Contact (${name})`)
        return res.send({invoices, contact, url: `https://go.xero.com/Contacts/View/${contactId}`})

    } catch (err) {
        const error = JSON.stringify(err, null, 2)
        console.log(error)
        return res.send(error)
    }
})

module.exports = router