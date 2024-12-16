// EncryptionClient.ts
import { createCipheriv, createDecipheriv, randomBytes, generateKeyPairSync, publicEncrypt, privateDecrypt, scryptSync } from 'crypto';

export class Encryptor {
    private algorithm: string;
    private key: Buffer;
    private iv: Buffer;
    private publicKey: string;
    private privateKey: string;
    private salt: string;

    constructor(password: string | undefined) {
        this.algorithm = 'aes-256-cbc';
        this.salt = `aB3$eF7!gH9@jK2#lM5%qR8^tW1*zX0&`
        this.iv = randomBytes(16); // Initialization vector
        if(password) {
            this.key = scryptSync(password, this.salt, 32)
        }
        else {
            this.key = scryptSync('bumoyu123', this.salt, 32)
        }
        // Generate RSA key pair
        const { publicKey, privateKey } = generateKeyPairSync('rsa', {
            modulusLength: 2048,
        });
        this.publicKey = publicKey.export({ type: 'spki', format: 'pem' }).toString();
        this.privateKey = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
    }

    public getPublicKey(): string {
        return this.publicKey;
    }

    public encrypt(text: string): string {
        console.log(this.key)
        const cipher = createCipheriv(this.algorithm, this.key, this.iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${this.iv.toString('hex')}:${encrypted}`; // Return IV with encrypted text
    }

    public decrypt(encryptedText: string): string {
        const [iv, encrypted] = encryptedText.split(':');
        const decipher = createDecipheriv(this.algorithm, this.key, Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    public encryptWithPublicKey(data: string, remotePublicKey: string): string {
        const encryptedData = publicEncrypt(remotePublicKey.replace(/\\n/g, '\n'), Buffer.from(data));
        return encryptedData.toString('base64'); // Return base64 encoded string
    }

    public decryptWithPrivateKey(encryptedData: string): string {
        const decryptedData = privateDecrypt(this.privateKey, Buffer.from(encryptedData, 'base64'));
        return decryptedData.toString('utf8'); // Return decrypted string
    }

    public finalEncrypt(text: string, remotePublicKey: string): string {
        const layerOne = this.encrypt(text);
        const layerTwo = this.encryptWithPublicKey(layerOne, remotePublicKey);
        return layerTwo
    }

    public finalDecrypt(text: string): string {
        const layerOne = this.decryptWithPrivateKey(text);
        const layerTwo = this.decrypt(layerOne);
        return layerTwo
    }
}