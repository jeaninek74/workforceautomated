import crypto from 'crypto';
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

/**
 * Zero-Knowledge End-to-End Encryption Service
 * 
 * This service implements client-side encryption where:
 * - User data is encrypted on the client before transmission
 * - Server stores only encrypted data and cannot decrypt it
 * - Only users with their private key can decrypt their data
 * - Uses NaCl (libsodium) for authenticated encryption
 */

export interface EncryptionKeyPair {
  publicKey: string;  // Base64 encoded
  privateKey: string; // Base64 encoded - stored securely on client only
  recoveryKey: string; // Base64 encoded - for account recovery
}

export interface EncryptedData {
  ciphertext: string;  // Base64 encoded encrypted data
  nonce: string;       // Base64 encoded nonce
  publicKey: string;   // Base64 encoded public key used for encryption
}

export class EncryptionService {
  /**
   * Generate a new encryption key pair for a user
   * Private key should be stored securely on the client side only
   * Public key is stored on the server
   */
  static generateKeyPair(): EncryptionKeyPair {
    const keyPair = nacl.box.keyPair();
    const recoveryKey = crypto.randomBytes(32);

    return {
      publicKey: encodeBase64(keyPair.publicKey),
      privateKey: encodeBase64(keyPair.secretKey),
      recoveryKey: encodeBase64(recoveryKey),
    };
  }

  /**
   * Encrypt data using the recipient's public key
   * This is called on the client side before sending to server
   */
  static encryptData(plaintext: string, recipientPublicKeyBase64: string): EncryptedData {
    const recipientPublicKey = decodeBase64(recipientPublicKeyBase64);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const plaintextBytes = Buffer.from(plaintext, 'utf-8');

    // Use a temporary ephemeral key pair for encryption
    const ephemeralKeyPair = nacl.box.keyPair();
    
    const ciphertext = nacl.box(
      plaintextBytes,
      nonce,
      recipientPublicKey,
      ephemeralKeyPair.secretKey
    );

    return {
      ciphertext: encodeBase64(ciphertext),
      nonce: encodeBase64(nonce),
      publicKey: recipientPublicKeyBase64,
    };
  }

  /**
   * Decrypt data using the user's private key
   * This is called on the client side only - server never calls this
   */
  static decryptData(
    encryptedData: EncryptedData,
    userPrivateKeyBase64: string,
    senderPublicKeyBase64: string
  ): string {
    const userPrivateKey = decodeBase64(userPrivateKeyBase64);
    const senderPublicKey = decodeBase64(senderPublicKeyBase64);
    const ciphertext = decodeBase64(encryptedData.ciphertext);
    const nonce = decodeBase64(encryptedData.nonce);

    const plaintext = nacl.box.open(
      ciphertext,
      nonce,
      senderPublicKey,
      userPrivateKey
    );

    if (!plaintext) {
      throw new Error('Decryption failed - data may be corrupted or key is incorrect');
    }

    return Buffer.from(plaintext).toString('utf-8');
  }

  /**
   * Generate a recovery key for account recovery
   * User stores this offline and can use it to regain access if password is lost
   */
  static generateRecoveryKey(): string {
    return encodeBase64(crypto.randomBytes(32));
  }

  /**
   * Hash a recovery key for storage (we store hash, not the key itself)
   */
  static hashRecoveryKey(recoveryKey: string): string {
    return crypto.createHash('sha256').update(recoveryKey).digest('hex');
  }

  /**
   * Verify a recovery key against its hash
   */
  static verifyRecoveryKey(recoveryKey: string, hash: string): boolean {
    const computedHash = this.hashRecoveryKey(recoveryKey);
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
  }

  /**
   * Create an encrypted backup of user data
   * Stored separately from main database for disaster recovery
   */
  static createEncryptedBackup(data: any, backupKey: string): EncryptedData {
    const plaintext = JSON.stringify(data);
    const keyHash = crypto.createHash('sha256').update(backupKey).digest();
    
    // Use AES-256-GCM for backup encryption
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', keyHash, iv);
    
    let encrypted = cipher.update(plaintext, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      ciphertext: encrypted + ':' + authTag.toString('hex'),
      nonce: iv.toString('hex'),
      publicKey: '', // Not used for backup encryption
    };
  }

  /**
   * Restore an encrypted backup
   * Only works with the correct backup key
   */
  static restoreEncryptedBackup(backup: EncryptedData, backupKey: string): any {
    const keyHash = crypto.createHash('sha256').update(backupKey).digest();
    const [encrypted, authTagHex] = backup.ciphertext.split(':');
    const iv = Buffer.from(backup.nonce, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyHash, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    
    return JSON.parse(decrypted);
  }
}
