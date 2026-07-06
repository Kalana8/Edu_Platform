import { createHash } from 'crypto';
import bcrypt from 'bcrypt';

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password.trim(), 10);
}

export function verifyPassword(password: string, storedHash?: string | null): boolean {
  if (!password || !storedHash) {
    return false;
  }

  const normalizedPassword = password.trim();
  const normalizedHash = storedHash.trim();

  if (!normalizedPassword || !normalizedHash) {
    return false;
  }

  if (normalizedHash === normalizedPassword) {
    return true;
  }

  if (normalizedHash.startsWith('sha256:')) {
    const hash = createHash('sha256').update(normalizedPassword).digest('hex');
    return hash === normalizedHash.slice('sha256:'.length);
  }

  if (normalizedHash.startsWith('$2')) {
    try {
      const result = bcrypt.compareSync(normalizedPassword, normalizedHash);
      console.log('bcrypt compare result', { passwordLength: normalizedPassword.length, hashPrefix: normalizedHash.slice(0, 7), result });
      return result;
    } catch (error) {
      console.error('bcrypt compare error', error);
      return false;
    }
  }

  const hash = createHash('sha256').update(normalizedPassword).digest('hex');
  return normalizedHash === hash;
}
