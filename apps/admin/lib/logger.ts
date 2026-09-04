/**
 * Centralised, environment-aware logger utility.
 * Suppresses debug, info, and warn statements in production to prevent leaking sensitive details
 * or cluttering client/server logs. Surfaces error logs with optional external tracking hooks.
 */

const IS_DEV = process.env.NODE_ENV !== 'production';

export const logger = {
  debug(message: string, ...args: any[]): void {
    if (IS_DEV) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  info(message: string, ...args: any[]): void {
    if (IS_DEV) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  warn(message: string, ...args: any[]): void {
    if (IS_DEV) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  error(message: string | any, error?: any, ...args: any[]): void {
    // Errors are genuinely tracked in both development and production.
    // They are printed to console.error in all environments.
    if (typeof message === 'string') {
      console.error(`[ERROR] ${message}`, error, ...args);
    } else {
      console.error(`[ERROR]`, message, error, ...args);
    }

    // --- Production Error Monitoring Service Integration (e.g. Sentry) ---
    // If you add Sentry, Bugsnag, or another monitoring service in the future,
    // you only need to wire it up here:
    // if (!IS_DEV) {
    //   if (error instanceof Error) {
    //     Sentry.captureException(error, { extra: { message, args } });
    //   } else {
    //     Sentry.captureMessage(`${message}: ${String(error)}`, { extra: { args } });
    //   }
    // }
  }
};
