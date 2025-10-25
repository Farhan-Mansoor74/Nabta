// lib/apiClient.ts
// Note: We only need 'supabaseClient' if we were going to directly query
// the database/storage via the client (which often requires the Bearer token),
// but for standard Next.js API routes, we don't need it here.
// I'll keep the import in case you use it elsewhere, but it's not used 
// for internal API calls in this file anymore.
import { supabase } from './supabaseClient'; // Assuming this is your createClientComponentClient/createBrowserClient

export class ApiClient {
  
  // ❌ REMOVED: getAuthHeaders is no longer needed as we rely on cookies.
  
  private static async request(url: string, options: RequestInit) {
    try {
      // 1. Initialize Headers (ONLY Content-Type is needed)
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');

      // 2. Merge any additional headers from options
      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((value, key) => {
            // Ensure we don't accidentally overwrite our required headers
            if (key.toLowerCase() !== 'content-type') {
                headers.set(key, value);
            }
          });
        } else if (Array.isArray(options.headers)) {
          options.headers.forEach(([key, value]) => {
            if (key.toLowerCase() !== 'content-type') {
                headers.set(key, value);
            }
          });
        } else if (typeof options.headers === 'object') {
          for (const key in options.headers) {
            if (options.headers.hasOwnProperty(key) && key.toLowerCase() !== 'content-type') {
              headers.set(key, options.headers[key]);
            }
          }
        }
      }

      // 3. Make the fetch request
      const response = await fetch(url, {
        ...options,
        // Ensure 'body' is null for GET/DELETE if options included one
        body: options.method === 'GET' || options.method === 'DELETE' ? undefined : options.body,
        headers,
        // ✅ CRITICAL: This tells the browser to include the session cookies
        // which your Next.js API routes (and middleware) are designed to read.
        credentials: 'include', 
      });

      const contentType = response.headers.get('content-type');
      let data: any = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
      } else if (contentType && contentType.includes('text/')) {
        data = await response.text().catch(() => null);
      }
      // If no content-type or other, data remains null

      if (!response.ok) {
        // This is the line (69) that was throwing the error
        const message =
          (data && (data.error || data.message || JSON.stringify(data))) ||
          `HTTP error ${response.status}`;
        throw new Error(message);
      }

      return data;
    } catch (error) {
      console.error(`🔥 API request failed [${options.method}] ${url}`, error);
      throw error;
    }
  }

  static get(url: string) {
    return this.request(url, { method: 'GET' });
  }

  static post(url: string, data: any) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static put(url: string, data: any) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static patch(url: string, data: any) {
    return this.request(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static delete(url: string) {
    return this.request(url, { method: 'DELETE' });
  }

  // This method is already correctly relying on cookies and is fine.
  static async uploadFile(url: string, formData: FormData) {
    try {
      // NOTE: When sending FormData, the browser sets the 'Content-Type' 
      // header (multipart/form-data) automatically, so we don't manually set it.
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include', // ✅ Correctly sends session cookies
      });

      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json')
        ? await response.json().catch(() => null)
        : await response.text().catch(() => null);

      if (!response.ok) {
        throw new Error(
          (data && (data.error || data.message)) ||
            `HTTP error ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error(`🔥 API upload failed: POST ${url}`, error);
      throw error;
    }
  }
}