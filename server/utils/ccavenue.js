const crypto = require('crypto');

class CCAvenue {
  constructor(workingKey) {
    if (!workingKey) {
      throw new Error('CCAvenue working key is required');
    }
    this.workingKey = workingKey;
  }

  encrypt(plainText) {
    try {
      const m = crypto.createHash('md5');
      m.update(this.workingKey);
      const key = m.digest();

      const iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
      const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);

      let encoded = cipher.update(plainText, 'utf8', 'hex');
      encoded += cipher.final('hex');

      return encoded;
    } catch (error) {
      console.error('CCAvenue encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encText) {
    try {
      const m = crypto.createHash('md5');
      m.update(this.workingKey);
      const key = m.digest();

      const iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);

      let decoded = decipher.update(encText, 'hex', 'utf8');
      decoded += decipher.final('utf8');

      return decoded;
    } catch (error) {
      console.error('CCAvenue decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  encryptData(params) {
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return this.encrypt(queryString);
  }

  decryptData(encryptedText) {
    const decrypted = this.decrypt(encryptedText);
    const params = {};

    decrypted.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key) {
        params[key] = value;
      }
    });

    return params;
  }
}

module.exports = CCAvenue;
