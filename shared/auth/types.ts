export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  error: boolean;
}

export const MIN_PASSWORD_LENGTH = 8;

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  return { valid: true };
}
