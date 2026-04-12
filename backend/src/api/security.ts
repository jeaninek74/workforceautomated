import express, { Router } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { authenticate } from '../middleware/auth.js';
import { EncryptionService } from '../services/encryptionService.js';
import { DRASSService } from '../services/drass.js';

const router: Router = express.Router();

/**
 * GET /api/security/encryption-key
 * Get or create the user's encryption public key
 */
router.get('/encryption-key', authenticate, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // For now, generate and return a key
    // In production, this would be stored in the database
    const keyPair = EncryptionService.generateKeyPair();

    res.json({
      publicKey: keyPair.publicKey,
      recoveryKey: keyPair.recoveryKey,
      message: 'Save your recovery key in a secure location. You will need it to access your data if you lose access to your account.',
    });
  } catch (error) {
    console.error('Error getting encryption key:', error);
    res.status(500).json({ error: 'Failed to get encryption key' });
  }
});

/**
 * POST /api/security/recovery-keys/generate
 * Generate a new recovery key for the user
 */
router.post('/recovery-keys/generate', authenticate, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { recoveryKey, keyId } = DRASSService.generateRecoveryKey(userId);

    res.json({
      recoveryKey,
      keyId,
      message: 'Recovery key generated. Store it in a safe location offline.',
    });
  } catch (error) {
    console.error('Error generating recovery key:', error);
    res.status(500).json({ error: 'Failed to generate recovery key' });
  }
});

/**
 * GET /api/security/recovery-keys
 * List all recovery keys for the user
 */
router.get('/recovery-keys', authenticate, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const keys = DRASSService.listRecoveryKeys(userId);
    res.json({ recoveryKeys: keys });
  } catch (error) {
    console.error('Error listing recovery keys:', error);
    res.status(500).json({ error: 'Failed to list recovery keys' });
  }
});

/**
 * DELETE /api/security/recovery-keys/:keyId
 * Revoke a recovery key
 */
router.delete('/recovery-keys/:keyId', authenticate, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { keyId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    DRASSService.revokeRecoveryKey(userId, keyId);
    res.json({ message: 'Recovery key revoked' });
  } catch (error) {
    console.error('Error revoking recovery key:', error);
    res.status(500).json({ error: 'Failed to revoke recovery key' });
  }
});

/**
 * POST /api/security/backup
 * Create an encrypted backup of user data
 */
router.post('/backup', authenticate, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { dataType, data, backupKey } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!dataType || !data || !backupKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const backup = DRASSService.createBackup(userId, dataType, data, backupKey);
    res.json({
      message: 'Backup created successfully',
      backup,
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

/**
 * GET /api/security/backups
 * List all backups for the user
 */
router.get('/backups', authenticate, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const backups = DRASSService.listBackups(userId);
    res.json({ backups });
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

/**
 * POST /api/security/backup/restore
 * Restore data from an encrypted backup
 */
router.post('/backup/restore', authenticate, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { backupId, backupKey } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!backupId || !backupKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the backup belongs to the requesting user
    const userBackups = DRASSService.listBackups(userId);
    const ownsBackup = userBackups.some((b: { id: string }) => b.id === backupId);
    if (!ownsBackup) {
      return res.status(403).json({ error: 'Forbidden: backup does not belong to this user' });
    }

    const restoredData = DRASSService.restoreBackup(backupId, backupKey);
    res.json({
      message: 'Backup restored successfully',
      data: restoredData,
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

/**
 * POST /api/security/verify-recovery-key
 * Verify a recovery key for secondary access (requires authentication)
 */
router.post('/verify-recovery-key', authenticate, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { recoveryKey } = req.body;

    if (!userId || !recoveryKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const isValid = DRASSService.verifyRecoveryKey(userId, recoveryKey);

    if (isValid) {
      res.json({ message: 'Recovery key verified', isValid: true });
    } else {
      res.status(401).json({ error: 'Invalid recovery key', isValid: false });
    }
  } catch (error) {
    console.error('Error verifying recovery key:', error);
    res.status(500).json({ error: 'Failed to verify recovery key' });
  }
});

export default router;
