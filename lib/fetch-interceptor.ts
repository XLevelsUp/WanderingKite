export interface FetchInterceptorConfig {
  allowedOrigins: string[];
  allowedPrefixes: string[];
  silentCodes: number[];
  onError: (status: number, url: string, customMessage?: string) => void;
  onAuthError: () => void;
}

// Store the original fetch before patching
const _originalFetch = typeof window !== 'undefined' ? window.fetch : null;

/**
 * Checks if a URL is owned by our application based on the scoping rules.
 */
export function isOwnedRequest(
  url: string,
  allowedOrigins: string[],
  allowedPrefixes: string[]
): boolean {
  // If it's a relative URL, it's owned
  if (url.startsWith('/')) {
    // Ensure it matches one of our allowed prefixes if provided, or just assume relative is owned
    if (allowedPrefixes.length > 0) {
      return allowedPrefixes.some((prefix) => url.startsWith(prefix));
    }
    return true;
  }

  try {
    const parsedUrl = new URL(url);

    // Check same origin
    if (
      typeof window !== 'undefined' &&
      parsedUrl.hostname === window.location.hostname
    ) {
      return true;
    }

    // Check allowed origins
    if (allowedOrigins.some((origin) => parsedUrl.hostname.includes(origin))) {
      return true;
    }

    return false;
  } catch (e) {
    // Invalid URL (might be relative without leading slash in some weird cases)
    return false;
  }
}

let interceptorSetup = false;

export function setupFetchInterceptor(config: FetchInterceptorConfig) {
  if (typeof window === 'undefined' || !_originalFetch) return;
  if (interceptorSetup) return;
  interceptorSetup = true;

  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit & { skipInterceptor?: boolean }
  ) {
    const urlStr =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    // Fast pass-through for skipped requests or non-owned requests
    if (init?.skipInterceptor || !isOwnedRequest(urlStr, config.allowedOrigins, config.allowedPrefixes)) {
      return _originalFetch(input, init);
    }

    try {
      const response = await _originalFetch(input, init);

      if (!response.ok) {
        if (config.silentCodes.includes(response.status)) {
          // Silently ignore specified codes
          return response;
        }

        switch (response.status) {
          case 401:
            config.onAuthError();
            break;
          case 403:
            config.onError(response.status, urlStr, "You don't have permission to do that.");
            break;
          case 404:
            // Handled mostly by silentCodes or custom logic if needed, but default is generic error
            // As per instructions, suppress silently if background. We rely on silentCodes=[404] if we want to suppress all.
            // If not suppressed, show error.
            if (!config.silentCodes.includes(404)) {
              config.onError(response.status, urlStr, "Resource not found.");
            }
            break;
          case 429:
            config.onError(response.status, urlStr, "Too many requests. Please wait a moment.");
            break;
          default:
            if (response.status >= 500) {
              config.onError(response.status, urlStr, "Something went wrong on our end. Please try again.");
            } else {
              // 400 Bad Request or other 4xx
              config.onError(response.status, urlStr, "Something went wrong. Please try again.");
            }
            break;
        }
      }

      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Ignored
        throw error;
      }

      // Network timeout / no response
      config.onError(0, urlStr, "Request timed out. Check your connection.");
      
      throw error;
    }
  };
}

export function restoreFetch() {
  if (typeof window !== 'undefined' && _originalFetch) {
    window.fetch = _originalFetch;
    interceptorSetup = false;
  }
}
