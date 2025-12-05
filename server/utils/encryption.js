const crypto = require('crypto');

class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        // Ensure 32-byte key (256 bits)
        this.key = this.getEncryptionKey();
    }

    // Generate or validate encryption key
    getEncryptionKey() {
        const envKey = process.env.ENCRYPTION_KEY||"01882b99c0b93664cc2b7161aeebb62aa3109260ddbea4681a96bd3e0d26f015";
        
        if (!envKey) {
            console.warn('⚠️ ENCRYPTION_KEY not set in environment. Using development key.');
            return this.generateKeyFromString('development-warranty-system-key-2024');
        }
        
        // Check if key is already 32 bytes (64 hex characters)
        if (envKey.length === 64 && /^[0-9a-fA-F]+$/.test(envKey)) {
            // It's a hex string, convert to buffer
            return Buffer.from(envKey, 'hex');
        }
        
        // Otherwise, derive 32-byte key from the string
        return this.generateKeyFromString(envKey);
    }

    // Generate 32-byte key from any string
    generateKeyFromString(str) {
        // Use PBKDF2 to derive a secure key
        const salt = 'warranty-system-salt-2024'; // You can make this an env variable too
        return crypto.pbkdf2Sync(str, salt, 100000, 32, 'sha256');
    }

    // Encrypt data
    encrypt(text) {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
            
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag().toString('hex');
            
            return JSON.stringify({
                iv: iv.toString('hex'),
                encryptedData: encrypted,
                authTag: authTag
            });
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    // Decrypt data
    decrypt(encryptedText) {
        try {
            const { iv, encryptedData, authTag } = JSON.parse(encryptedText);
            
            const decipher = crypto.createDecipheriv(
                this.algorithm,
                this.key,
                Buffer.from(iv, 'hex')
            );
            
            decipher.setAuthTag(Buffer.from(authTag, 'hex'));
            
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Invalid encrypted data');
        }
    }

    // Create hash for verification
    createHash(data) {
        try {
            return crypto
                .createHash('sha256')
                .update(data + this.key.toString('hex'))
                .digest('hex')
                .substr(0, 16)
                .toUpperCase();
        } catch (error) {
            console.error('Hash creation error:', error);
            return crypto
                .createHash('sha256')
                .update(data + 'fallback-key')
                .digest('hex')
                .substr(0, 16)
                .toUpperCase();
        }
    }

    // Generate a random key (for setting in .env)
    generateRandomKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Test encryption/decryption
    testEncryption() {
        try {
            const testData = 'Test encryption data';
            const encrypted = this.encrypt(testData);
            const decrypted = this.decrypt(encrypted);
            
            return {
                success: true,
                testData,
                encrypted,
                decrypted,
                keyLength: this.key.length,
                algorithm: this.algorithm
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new EncryptionService();