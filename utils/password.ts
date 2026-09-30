// Same rules as passwordPolicyError() in server.js — keep both in sync
export const PASSWORD_HINT = 'Mínimo 8 caracteres, con mayúsculas, minúsculas y números.';

export function passwordPolicyError(password: string): string | null {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (password.length > 128) return 'La contraseña no puede superar 128 caracteres';
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'La contraseña debe tener mayúsculas, minúsculas y números';
  }
  return null;
}
