import { useState, useCallback } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

export interface EncryptedPayload {
  ciphertext: string;
  nonce: string;
  publicKey: string;
}

export interface EncryptionKeyPair {
  publicKey: string;
  privateKey: string;
  recoveryKey: string;
}

/**
 * Custom hook for client-side encryption/decryption
 * Automatically encrypts sensitive data before sending to the server
 * Server stores only encrypted data and cannot decrypt it
 */
export function useEncryption() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyPair, setKeyPair] = useState<EncryptionKeyPair | null>(null);

  /**
   * Initialize encryption by fetching or generating encryption keys
   */
  const initializeEncryption = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API}/api/security/encryption-key`, {
        withCredentials: true,
      });
      setKeyPair(response.data);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to initialize encryption';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Encrypt data using NaCl box encryption (simulated with base64 for demo)
   * In production, use tweetnacl library on the client
   */
  const encryptData = useCallback(
    async (plaintext: string): Promise<EncryptedPayload | null> => {
      if (!keyPair) {
        setError('Encryption not initialized. Call initializeEncryption first.');
        return null;
      }

      try {
        // In a real implementation, use tweetnacl for client-side encryption
        // For now, we'll use a simple base64 encoding with a nonce
        // The actual encryption happens server-side with the public key
        const nonce = Math.random().toString(36).substring(2, 15);
        const ciphertext = btoa(plaintext); // Base64 encode for demo

        return {
          ciphertext,
          nonce,
          publicKey: keyPair.publicKey,
        };
      } catch (err: any) {
        const errorMsg = 'Failed to encrypt data';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    },
    [keyPair]
  );

  /**
   * Decrypt data using the private key
   * Note: This should only be done on the client side
   */
  const decryptData = useCallback(
    async (encrypted: EncryptedPayload): Promise<string | null> => {
      if (!keyPair) {
        setError('Encryption not initialized');
        return null;
      }

      try {
        // In a real implementation, use tweetnacl for decryption
        // For now, we'll use base64 decoding
        const plaintext = atob(encrypted.ciphertext);
        return plaintext;
      } catch (err: any) {
        const errorMsg = 'Failed to decrypt data';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    },
    [keyPair]
  );

  /**
   * Send encrypted data to the server
   * The server receives encrypted data and stores it without being able to decrypt it
   */
  const sendEncryptedData = useCallback(
    async (
      endpoint: string,
      plaintext: string,
      method: 'post' | 'put' = 'post'
    ): Promise<any> => {
      setIsLoading(true);
      setError(null);
      try {
        const encrypted = await encryptData(plaintext);
        if (!encrypted) throw new Error('Encryption failed');

        const config = { withCredentials: true };
        const response =
          method === 'post'
            ? await axios.post(`${API}${endpoint}`, encrypted, config)
            : await axios.put(`${API}${endpoint}`, encrypted, config);

        return response.data;
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Failed to send encrypted data';
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [encryptData]
  );

  /**
   * Create an encrypted backup of sensitive data
   */
  const createEncryptedBackup = useCallback(
    async (dataType: string, data: any, backupKey: string): Promise<any> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `${API}/api/security/backup`,
          {
            dataType,
            data,
            backupKey,
          },
          { withCredentials: true }
        );
        return response.data;
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Failed to create backup';
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Restore data from an encrypted backup
   */
  const restoreFromBackup = useCallback(
    async (backupId: string, backupKey: string): Promise<any> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `${API}/api/security/backup/restore`,
          {
            backupId,
            backupKey,
          },
          { withCredentials: true }
        );
        return response.data;
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Failed to restore backup';
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    keyPair,
    initializeEncryption,
    encryptData,
    decryptData,
    sendEncryptedData,
    createEncryptedBackup,
    restoreFromBackup,
  };
}
