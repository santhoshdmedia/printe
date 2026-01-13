// utils/ccavenue.js
const crypto = require('crypto');

class CCAvenue {
  constructor(workingKey) {
    this.workingKey = workingKey;
  }

  encryptData(plainText) {
    try {
      // CCAvenue encryption logic
      const m = crypto.createHash('md5');
      m.update(this.workingKey);
      const key = m.digest();
      
      const iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
      const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
      
      let encrypted = cipher.update(plainText, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  decryptData(encryptedText) {
    try {
      // CCAvenue decryption logic
      const m = crypto.createHash('md5');
      m.update(this.workingKey);
      const key = m.digest();
      
      const iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
      
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Parse the decrypted string to object
      const params = new URLSearchParams(decrypted);
      const result = {};
      
      for (const [key, value] of params) {
        result[key] = value;
      }
      
      return result;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}

module.exports = CCAvenue;