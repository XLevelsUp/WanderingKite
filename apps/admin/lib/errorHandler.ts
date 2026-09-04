/**
 * Utility to parse and translate raw Supabase/Postgres errors into human-readable messages.
 */
export function parseSupabaseError(error: any, fallback = 'An unexpected error occurred. Please try again.'): string {
  if (!error) return fallback;

  // Sometimes error is a string
  if (typeof error === 'string') {
    if (error.includes("Could not find a relationship")) {
      return "We are having trouble loading the clients directory due to a temporary system synchronization issue. Please try again in a few moments.";
    }
    return error;
  }

  // Handle PostgREST specific messages
  if (error.message) {
    if (error.message.includes("Could not find a relationship")) {
      return "We are having trouble retrieving client records due to a system synchronization issue. Please try refreshing the page in a moment.";
    }
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      return "Our studio database is currently undergoing quick maintenance. Some client features may be temporarily unavailable. Please try again shortly.";
    }
  }

  // Handle PostgREST database errors
  if (error.code) {
    switch (error.code) {
      case '23505': { // unique_violation
        // error.detail is Postgres's own "Key (column_name)=(value) already
        // exists." message — the real column name, straight from Postgres.
        // Prefer it over parsing the constraint name: Postgres auto-names
        // unique constraints "<table>_<column>_key", and naively taking the
        // last '_'-segment of that (the old approach) always returns the
        // literal word "key", not the column.
        const detailMatch = error.detail?.match(/Key \(([^)]+)\)=/i);
        const constraintMatch = error.message?.match(/unique constraint "(.*?)"/i);

        let field = detailMatch?.[1];
        if (!field && constraintMatch?.[1]) {
          field = constraintMatch[1].replace(/_key$/i, '').split('_').pop();
        }

        if (field) {
          const friendlyField = field === 'serialNumber' || field === 'serial_number' ? 'serial number' : field;
          return `This ${friendlyField} is already in use. Please use a different one.`;
        }
        return 'This record already exists. Please check for duplicates.';
      }
      case '23503': // foreign_key_violation
        return 'This operation cannot be completed because it references a record that does not exist.';
      case '23502': // not_null_violation
        return 'A required field is missing. Please fill out all required fields.';
      case '42501': // insufficient_privilege
        return 'Your account does not have permission to perform this action.';
      case '42703': // undefined_column
      case '42P01': // undefined_table
        return 'We are experiencing system maintenance issues. The database setup is out of sync. Please contact support.';
      case '08001': // sqlclient_unable_to_establish_sqlconnection
      case '08006': // connection_failure
        return 'Unable to connect to the studio network. Please check your internet connection and try again.';
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
