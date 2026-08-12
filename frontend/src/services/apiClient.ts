/**
 * Base API client to communicate with the FastAPI backend.
 * Uses the proxy configured in vite.config.ts to route /api requests to localhost:8000.
 */
export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`API GET request failed: ${response.statusText}`);
    }
    return response.json();
  },
  
  post: async (endpoint: string, data: any) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API POST request failed: ${response.statusText}`);
    }
    return response.json();
  },

  put: async (endpoint: string, data: any) => {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API PUT request failed: ${response.statusText}`);
    }
    return response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetch(endpoint, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`API DELETE request failed: ${response.statusText}`);
    }
    return response.json();
  },
};
