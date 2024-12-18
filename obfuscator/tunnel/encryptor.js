"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encryptor = void 0;
// EncryptionClient.ts
const crypto_1 = require("crypto");
class Encryptor {
    constructor(password) {
        this.remotePublicKey = '';
        this.algorithm = 'aes-256-cbc';
        if (password) {
            this.password = password;
        }
        else {
            this.password = 'bumoyu123';
        }
        // Generate RSA key pair
        const { publicKey, privateKey } = (0, crypto_1.generateKeyPairSync)('rsa', {
            modulusLength: 2048,
        });
        this.publicKey = publicKey.export({ type: 'spki', format: 'pem' }).toString();
        this.privateKey = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
    }
    generateSalt(length = 16) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let salt = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            salt += charset[randomIndex];
        }
        return salt;
    }
    encrypt(text, key, iv) {
        const cipher = (0, crypto_1.createCipheriv)(this.algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted; // Return encrypted text
    }
    decrypt(encryptedText, key, iv) {
        const decipher = (0, crypto_1.createDecipheriv)(this.algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    encryptWithPublicKey(data, remotePublicKey) {
        const encryptedData = (0, crypto_1.publicEncrypt)(remotePublicKey, Buffer.from(data, 'base64'));
        return encryptedData.toString('base64'); // Return base64 encoded string
    }
    decryptWithPrivateKey(encryptedData) {
        const decryptedData = (0, crypto_1.privateDecrypt)(this.privateKey, Buffer.from(encryptedData, 'base64'));
        return decryptedData.toString('base64'); // Return decrypted string
    }
    finalEncrypt(text, remotePublicKey) {
        const that = this;
        let salt = this.generateSalt();
        let key = (0, crypto_1.scryptSync)(that.password, salt, 32); // Generate a key from the password
        let iv = (0, crypto_1.randomBytes)(16); // Initialization vector
        let d_send = that.encrypt(text, key, iv);
        let k_send = that.encryptWithPublicKey(key.toString('base64'), remotePublicKey);
        let i_send = iv.toString('base64');
        let data = {
            d: d_send,
            k: k_send,
            i: i_send
        };
        return data;
    }
    finalDecrypt(data) {
        const { d, k, i } = data;
        let k_receive = this.decryptWithPrivateKey(k);
        let i_receive = Buffer.from(i, 'base64');
        let d_receive = this.decrypt(d, Buffer.from(k_receive, 'base64'), i_receive); //decrypt(d, k_receive, i_receive)
        return d_receive;
    }
}
exports.Encryptor = Encryptor;
