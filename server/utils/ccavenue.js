// utils/ccavenue.js - IMPROVED VERSION
const crypto = require('crypto');

class CCAvenue {
  constructor(workingKey) {
    if (!workingKey || typeof workingKey !== 'string') {
      throw new Error('Valid working key required');
    }
    this.workingKey = workingKey.trim();
  }

  encrypt(plainText) {
    try {
      const m = crypto.createHash('md5');
      m.update(this.workingKey);
      const key = m.digest();
      const iv = Buffer.from('\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f');
      const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
      let encoded = cipher.update(plainText, 'utf8', 'hex');
      encoded += cipher.final('hex');
      return encoded;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  decrypt(encText) {
    try {
      const m = crypto.createHash('md5');
      m.update(this.workingKey);
      const key = m.digest();
      const iv = Buffer.from('\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f');
      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
      let decoded = decipher.update(encText, 'hex', 'utf8');
      decoded += decipher.final('utf8');
      return decoded;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  encryptData(params) {
    // Remove any undefined, null, or empty string values
    const cleanParams = Object.keys(params)
      .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '')
      .reduce((obj, k) => {
        obj[k] = params[k];
        return obj;
      }, {});

    const query = Object.keys(cleanParams)
      .map(k => `${k}=${params[k]}`)  // Don't double-encode
      .join('&');
    
    console.log('Query string to encrypt:', query);
    return this.encrypt(query);
  }

  decryptData(encText) {
    const decrypted = this.decrypt(encText);
    const params = {};
    decrypted.split('&').forEach(param => {
      const [key, ...valueParts] = param.split('=');
      if (key) params[key] = valueParts.join('='); // Handle values with '='
    });
    return params;
  }
}

module.exports = CCAvenue;