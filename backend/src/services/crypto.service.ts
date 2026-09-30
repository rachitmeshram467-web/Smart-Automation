import crypto from 'crypto';
import { ENV } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';

function getSecretKey(): Buffer {
  let keyStr = ENV.ENCRYPTION_SECRET_KEY;
  if (keyStr.length < 32) {
    keyStr = keyStr.padEnd(32, '0');
  } else if (keyStr.length > 32) {
    keyStr = keyStr.substring(0, 32);
  }
  return Buffer.from(keyStr, 'utf-8');
}

export interface EncryptedPayload {
  encrypted: string;
  iv: string;
  tag: string;
}

export function encryptSecret(plainText: string): EncryptedPayload {
  const iv = crypto.randomBytes(16);
  const key = getSecretKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag,
  };
}

export function decryptSecret(payload: EncryptedPayload): string {
  try {
    const key = getSecretKey();
    const iv = Buffer.from(payload.iv, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(Buffer.from(payload.tag, 'hex'));

    let decrypted = decipher.update(payload.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err: any) {
    console.error('Decryption error:', err.message);
    return '***decryption_failed***';
  }
}
