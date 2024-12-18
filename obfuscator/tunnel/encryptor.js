"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encryptor = void 0;
// EncryptionClient.ts
const crypto_1 = require("crypto");
class Encryptor {
    constructor(password) {
        this.algorithm = 'aes-256-cbc';
        this.salt = `aB3$eF7!gH9@jK2#lM5%qR8^tW1*zX0&`;
        this.iv = (0, crypto_1.randomBytes)(16); // Initialization vector
        if (password) {
            this.key = (0, crypto_1.scryptSync)(password, this.salt, 32);
        }
        else {
            this.key = (0, crypto_1.scryptSync)('bumoyu123', this.salt, 32);
        }
        // Generate RSA key pair
        const { publicKey, privateKey } = (0, crypto_1.generateKeyPairSync)('rsa', {
            modulusLength: 2048,
        });
        this.publicKey = publicKey.export({ type: 'spki', format: 'pem' }).toString();
        this.privateKey = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
    }
    getPublicKey() {
        return this.publicKey;
    }
    encrypt(text) {
        console.log(this.key);
        const cipher = (0, crypto_1.createCipheriv)(this.algorithm, this.key, this.iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${this.iv.toString('hex')}:${encrypted}`; // Return IV with encrypted text
    }
    decrypt(encryptedText) {
        const [iv, encrypted] = encryptedText.split(':');
        const decipher = (0, crypto_1.createDecipheriv)(this.algorithm, this.key, Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    encryptWithPublicKey(data, remotePublicKey) {
        const encryptedData = (0, crypto_1.publicEncrypt)(remotePublicKey.replace(/\\n/g, '\n'), Buffer.from(data));
        return encryptedData.toString('base64'); // Return base64 encoded string
    }
    decryptWithPrivateKey(encryptedData) {
        const decryptedData = (0, crypto_1.privateDecrypt)(this.privateKey, Buffer.from(encryptedData, 'base64'));
        return decryptedData.toString('utf8'); // Return decrypted string
    }
    finalEncrypt(text, remotePublicKey) {
        const layerOne = this.encrypt(text);
        const layerTwo = this.encryptWithPublicKey(layerOne, remotePublicKey);
        return layerTwo;
    }
    finalDecrypt(text) {
        const layerOne = this.decryptWithPrivateKey(text);
        const layerTwo = this.decrypt(layerOne);
        return layerTwo;
    }
}
exports.Encryptor = Encryptor;
