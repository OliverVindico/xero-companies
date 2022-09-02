module.exports.stringToBase64 = (str) => {
    return Buffer.from(str).toString("base64") 
}
  
module.exports.base64ToString = (b64) => {
    return Buffer.from(b64, "base64").toString("ascii") 
}

