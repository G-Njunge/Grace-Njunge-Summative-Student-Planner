/**
 * Email Validation Module
 * Provides comprehensive email validation and sanitization
 */

/**
 * Validate email format using strict RFC 5322 compliant regex
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Trim whitespace
  email = email.trim();
  
  // Check length constraints
  if (email.length === 0 || email.length > 254) {
    return false;
  }
  
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Split email into local and domain parts
  const [localPart, domain] = email.split('@');
  
  // Validate local part (before @)
  // Must have at least 1 character and no more than 64 characters
  if (!localPart || localPart.length === 0 || localPart.length > 64) {
    return false;
  }
  
  // Local part must contain at least one letter (not just numbers/symbols)
  if (!/[a-zA-Z]/.test(localPart)) {
    return false;
  }
  
  // Local part cannot start or end with a dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }
  
  // Local part cannot have consecutive dots
  if (localPart.includes('..')) {
    return false;
  }
  
  // Validate domain part (after @)
  if (!domain || domain.length > 253) {
    return false;
  }
  
  // Domain must have at least one dot
  if (!domain.includes('.')) {
    return false;
  }
  
  // Domain cannot start or end with a dot or hyphen
  if (domain.startsWith('.') || domain.endsWith('.') || 
      domain.startsWith('-') || domain.endsWith('-')) {
    return false;
  }
  
  // Split domain into labels (parts between dots)
  const domainLabels = domain.split('.');
  
  // Each label must be valid
  for (const label of domainLabels) {
    // Label cannot be empty or longer than 63 characters
    if (label.length === 0 || label.length > 63) {
      return false;
    }
    
    // Label cannot start or end with hyphen
    if (label.startsWith('-') || label.endsWith('-')) {
      return false;
    }
    
    // Label must contain only alphanumeric characters and hyphens
    if (!/^[a-zA-Z0-9-]+$/.test(label)) {
      return false;
    }
  }
  
  // Top-level domain (last label) must be at least 2 characters and alphabetic
  const tld = domainLabels[domainLabels.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return false;
  }
  
  return true;
}

/**
 * Sanitize email address
 * @param {string} email - Email address to sanitize
 * @returns {string} Sanitized email address
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  // Trim whitespace and convert to lowercase
  email = email.trim().toLowerCase();
  
  // Remove any characters that are not allowed in emails
  email = email.replace(/[^a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~@-]/g, '');
  
  return email;
}

/**
 * Get detailed email validation error message
 * @param {string} email - Email address to validate
 * @returns {string|null} Error message or null if valid
 */
export function getEmailValidationError(email) {
  if (!email || typeof email !== 'string') {
    return 'Email address is required';
  }
  
  email = email.trim();
  
  if (email.length === 0) {
    return 'Email address is required';
  }
  
  if (email.length > 254) {
    return 'Email address is too long (maximum 254 characters)';
  }
  
  if (!email.includes('@')) {
    return 'Email address must contain @ symbol';
  }
  
  const atCount = (email.match(/@/g) || []).length;
  if (atCount > 1) {
    return 'Email address can only contain one @ symbol';
  }
  
  const [localPart, domain] = email.split('@');
  
  if (!localPart || localPart.length === 0) {
    return 'Email address must have at least one character before @';
  }
  
  if (!/[a-zA-Z]/.test(localPart)) {
    return 'Username must contain at least one letter';
  }
  
  if (localPart.length > 64) {
    return 'Local part is too long (maximum 64 characters)';
  }
  
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return 'Local part cannot start or end with a dot';
  }
  
  if (localPart.includes('..')) {
    return 'Local part cannot contain consecutive dots';
  }
  
  if (!domain) {
    return 'Email address must have a domain after @';
  }
  
  if (!domain.includes('.')) {
    return 'Domain must contain at least one dot';
  }
  
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return 'Domain cannot start or end with a dot';
  }
  
  if (domain.startsWith('-') || domain.endsWith('-')) {
    return 'Domain cannot start or end with a hyphen';
  }
  
  const domainLabels = domain.split('.');
  const tld = domainLabels[domainLabels.length - 1];
  
  if (tld.length < 2) {
    return 'Top-level domain must be at least 2 characters';
  }
  
  if (!/^[a-zA-Z]+$/.test(tld)) {
    return 'Top-level domain must contain only letters';
  }
  
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
}

/**
 * Validate email input in real-time
 * @param {HTMLInputElement} inputElement - Email input element
 * @param {HTMLElement} errorElement - Element to display error message
 * @returns {boolean} True if valid
 */
export function validateEmailInput(inputElement, errorElement) {
  if (!inputElement) {
    return false;
  }
  
  const email = inputElement.value;
  const error = getEmailValidationError(email);
  
  if (error) {
    inputElement.classList.add('error');
    inputElement.classList.remove('success');
    
    if (errorElement) {
      errorElement.textContent = error;
      errorElement.style.display = 'block';
    }
    
    return false;
  } else {
    inputElement.classList.remove('error');
    inputElement.classList.add('success');
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
    
    return true;
  }
}

/**
 * Setup real-time email validation for an input field
 * @param {string} inputId - ID of the email input element
 * @param {string} errorId - ID of the error message element
 * @returns {Object} Validation controller with cleanup method
 */
export function setupEmailValidation(inputId, errorId) {
  const inputElement = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);
  
  if (!inputElement) {
    console.warn(`Email input element with id "${inputId}" not found`);
    return null;
  }
  
  // Validate on input (real-time)
  const inputHandler = () => {
    // Only validate if field has been touched and has content
    if (inputElement.value.length > 0) {
      validateEmailInput(inputElement, errorElement);
    } else {
      // Clear validation state if field is empty
      inputElement.classList.remove('error', 'success');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
      }
    }
  };
  
  // Validate on blur (when user leaves the field)
  const blurHandler = () => {
    if (inputElement.value.length > 0) {
      validateEmailInput(inputElement, errorElement);
    }
  };
  
  // Sanitize on input
  const sanitizeHandler = () => {
    const cursorPosition = inputElement.selectionStart;
    const sanitized = sanitizeEmail(inputElement.value);
    
    if (sanitized !== inputElement.value) {
      inputElement.value = sanitized;
      inputElement.setSelectionRange(cursorPosition, cursorPosition);
    }
  };
  
  inputElement.addEventListener('input', inputHandler);
  inputElement.addEventListener('input', sanitizeHandler);
  inputElement.addEventListener('blur', blurHandler);
  
  // Return cleanup function
  return {
    cleanup: () => {
      inputElement.removeEventListener('input', inputHandler);
      inputElement.removeEventListener('input', sanitizeHandler);
      inputElement.removeEventListener('blur', blurHandler);
    },
    validate: () => validateEmailInput(inputElement, errorElement),
    getEmail: () => inputElement.value.trim().toLowerCase()
  };
}

/**
 * Common email domains for suggestions
 */
export const COMMON_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'mail.com',
  'zoho.com',
  'yandex.com'
];

/**
 * Suggest email domain corrections
 * @param {string} email - Email address
 * @returns {string|null} Suggested email or null
 */
export function suggestEmailDomain(email) {
  if (!email || !email.includes('@')) {
    return null;
  }
  
  const [localPart, domain] = email.split('@');
  
  if (!domain || domain.includes('.')) {
    return null;
  }
  
  // Find similar domain
  for (const commonDomain of COMMON_EMAIL_DOMAINS) {
    if (commonDomain.startsWith(domain.toLowerCase())) {
      return `${localPart}@${commonDomain}`;
    }
  }
  
  return null;
}
