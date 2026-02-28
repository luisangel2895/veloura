export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isRequiredText(value: string, minLength = 1) {
  return value.trim().length >= minLength;
}
