/**
 * Utility to parse and translate raw Supabase/Postgres errors into human-readable messages.
 */
export function parseSupabaseError(error: any, fallback = 'An unexpected error occurred. Please try again.'): string {
  if (!error) return fallback;

  // Sometimes error is a string
  if (typeof error === 'string') {
    return error;
  }

  // Handle PostgREST database errors
  if (error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        // Try to extract the field name if possible (usually in the detail or message)
        const match = error.message?.match(/unique constraint "(.*?)"/i) || error.detail?.match(/Key \((.*?)\)=/i);
        if (match && match[1]) {
          const field = match[1].split('_').pop() || match[1];
          return `This ${field} is already in use. Please use a different one.`;
        }
        return 'This record already exists. Please check for duplicates.';
      case '23503': // foreign_key_violation
        return 'This operation cannot be completed because it references a record that does not exist.';
      case '23502': // not_null_violation
        return 'A required field is missing. Please fill out all required fields.';
      case '42501': // insufficient_privilege
        return 'You do not have permission to perform this action.';
      default:
        return error.message || fallback;
    }
  }

  // Handle Auth Errors
  if (error.status) {
    switch (error.status) {
      case 400:
        if (error.message?.includes('User already registered')) {
          return 'This email is already registered in our system.';
        }
        if (error.message?.includes('Password should be')) {
          return error.message; // Let the exact password requirement pass through
        }
        break;
      case 401:
      case 403:
        return 'Unauthorized access. Please log in and try again.';
    }
  }

  // Fallback to error message if it exists and seems readable
  if (error.message && error.message.length < 100) {
    return error.message;
  }

  return fallback;
}
