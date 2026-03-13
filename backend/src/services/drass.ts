import { EncryptionService } from './encryptionService.js';

/**
 * DRASS System - Disaster Recovery & System Security
 * 
 * Provides:
 * 1. Encrypted backups stored separately from main database
 * 2. Recovery keys for users to access data if system is compromised
 * 3. Secondary authentication method via recovery keys
 * 4. Backup restoration process
 */

export interface RecoveryKey {
  id: string;
  userId: number;
  keyHash: string; // Hash of the actual recovery key (never store plaintext)
  createdAt: Date;
  lastUsedAt?: Date;
  isActive: boolean;
}

export interface BackupMetadata {
  id: string;
  userId: number;
  dataType: 'agents' | 'teams' | 'executions' | 'audit_log' | 'full_export';
  backupDate: Date;
  encryptedSize: number; // Size of encrypted backup in bytes
  checksum: string; // SHA-256 checksum for integrity verification
  storageLocation: string; // Separate storage location (not main DB)
  isVerified: boolean;
  expiresAt: Date; // Backups expire after 90 days
}

// In-memory storage for recovery keys (in production, use database)
const recoveryKeysStore = new Map<string, RecoveryKey>();
const backupsStore = new Map<string, { metadata: BackupMetadata; encryptedData: string }>();

export class DRASSService {
  /**
   * Generate a recovery key for a user
   * User must store this securely offline
   * This key can be used to access encrypted data if the account is compromised
   */
  static generateRecoveryKey(userId: number): { recoveryKey: string; keyId: string } {
    const recoveryKey = EncryptionService.generateRecoveryKey();
    const keyHash = EncryptionService.hashRecoveryKey(recoveryKey);
    const keyId = crypto.randomUUID();

    // Store only the hash in memory (in production, use database)
    recoveryKeysStore.set(keyId, {
      id: keyId,
      userId,
      keyHash,
      createdAt: new Date(),
      isActive: true,
    });

    // Return the actual key to the user (they must save it)
    return { recoveryKey, keyId };
  }

  /**
   * Verify a recovery key and allow access to encrypted data
   * Secondary authentication method
   */
  static verifyRecoveryKey(userId: number, recoveryKey: string): boolean {
    const keyHash = EncryptionService.hashRecoveryKey(recoveryKey);

    // Find the recovery key for this user
    for (const [, key] of recoveryKeysStore) {
      if (key.userId === userId && key.keyHash === keyHash && key.isActive) {
        // Update last used timestamp
        key.lastUsedAt = new Date();
        return true;
      }
    }

    return false;
  }

  /**
   * List all recovery keys for a user
   */
  static listRecoveryKeys(userId: number): RecoveryKey[] {
    const keys: RecoveryKey[] = [];
    for (const [, key] of recoveryKeysStore) {
      if (key.userId === userId) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Revoke a recovery key
   */
  static revokeRecoveryKey(userId: number, keyId: string): void {
    const key = recoveryKeysStore.get(keyId);
    if (key && key.userId === userId) {
      key.isActive = false;
    }
  }

  /**
   * Create an encrypted backup of user data
   * Stores encrypted data separately from main database
   */
  static createBackup(
    userId: number,
    dataType: 'agents' | 'teams' | 'executions' | 'audit_log' | 'full_export',
    data: unknown,
    backupKey: string
  ): BackupMetadata {
    const backupId = crypto.randomUUID();

    // Encrypt the data using AES-256-GCM
    const encryptedBackup = EncryptionService.createEncryptedBackup(data, backupKey);
    const encryptedDataString = JSON.stringify(encryptedBackup);
    const checksum = require('crypto')
      .createHash('sha256')
      .update(encryptedDataString)
      .digest('hex');

    const metadata: BackupMetadata = {
      id: backupId,
      userId,
      dataType,
      backupDate: new Date(),
      encryptedSize: encryptedDataString.length,
      checksum,
      storageLocation: `s3://backups/${userId}/${backupId}`,
      isVerified: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    };

    // Store in separate location (in production, use S3 or separate DB)
    backupsStore.set(backupId, {
      metadata,
      encryptedData: encryptedDataString,
    });

    return metadata;
  }

  /**
   * List all backups for a user
   */
  static listBackups(userId: number): BackupMetadata[] {
    const backups: BackupMetadata[] = [];
    for (const [, backup] of backupsStore) {
      if (backup.metadata.userId === userId) {
        backups.push(backup.metadata);
      }
    }
    return backups;
  }

  /**
   * Restore data from an encrypted backup
   */
  static restoreBackup(backupId: string, backupKey: string): unknown {
    const backup = backupsStore.get(backupId);
    if (!backup) {
      throw new Error('Backup not found');
    }

    // Verify checksum
    const currentChecksum = require('crypto')
      .createHash('sha256')
      .update(backup.encryptedData)
      .digest('hex');
    if (currentChecksum !== backup.metadata.checksum) {
      throw new Error('Backup integrity check failed');
    }

    // Decrypt the data
    const encryptedBackup = JSON.parse(backup.encryptedData);
    const decryptedData = EncryptionService.restoreEncryptedBackup(encryptedBackup, backupKey);
    return decryptedData;
  }

  /**
   * Verify backup integrity
   */
  static verifyBackupIntegrity(backupId: string): boolean {
    const backup = backupsStore.get(backupId);
    if (!backup) {
      return false;
    }

    const currentChecksum = require('crypto')
      .createHash('sha256')
      .update(backup.encryptedData)
      .digest('hex');
    return currentChecksum === backup.metadata.checksum;
  }

  /**
   * Delete expired backups
   */
  static deleteExpiredBackups(): number {
    let deletedCount = 0;
    const now = new Date();

    for (const [backupId, backup] of backupsStore) {
      if (backup.metadata.expiresAt < now) {
        backupsStore.delete(backupId);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get backup statistics for a user
   */
  static getBackupStats(userId: number): {
    totalBackups: number;
    totalSize: number;
    oldestBackup?: Date;
    newestBackup?: Date;
  } {
    let totalSize = 0;
    let oldestBackup: Date | undefined;
    let newestBackup: Date | undefined;
    let count = 0;

    for (const [, backup] of backupsStore) {
      if (backup.metadata.userId === userId) {
        count++;
        totalSize += backup.metadata.encryptedSize;

        if (!oldestBackup || backup.metadata.backupDate < oldestBackup) {
          oldestBackup = backup.metadata.backupDate;
        }

        if (!newestBackup || backup.metadata.backupDate > newestBackup) {
          newestBackup = backup.metadata.backupDate;
        }
      }
    }

    return {
      totalBackups: count,
      totalSize,
      oldestBackup,
      newestBackup,
    };
  }
}
