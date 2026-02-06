// src/lib/apiClient.ts (Your structure + The Fix)

// 1. Your existing Base URLs (This part is correct)
const PRODUCT_API = process.env.NEXT_PUBLIC_PRODUCT_API_URL;
const ORDER_API = process.env.NEXT_PUBLIC_ORDER_API_URL;
const CART_API = process.env.NEXT_PUBLIC_CART_API_URL;

// 2. Your existing Helper functions (These are also correct)
const cleanEndpointPath = (endpoint: string): string => {
  let clean = endpoint.replace(/^\/+/, '');
  if (clean.startsWith('api/')) {
    clean = clean.replace(/^api\//, '');
  }
  return clean;
};

const getBaseUrl = (cleanEndpoint: string): string => {
  if (cleanEndpoint.startsWith('products') || cleanEndpoint.startsWith('suppliers') || cleanEndpoint.startsWith('social') || cleanEndpoint.startsWith('homepage')) {
    return PRODUCT_API || '';
  }
  if (cleanEndpoint.startsWith('cart')) {
    return CART_API || '';
  }
  if (cleanEndpoint.startsWith('orders') || cleanEndpoint.startsWith('user') || cleanEndpoint.startsWith('auth') || cleanEndpoint.startsWith('wallet') || cleanEndpoint.startsWith('chats') || cleanEndpoint.startsWith('notifications')) {
    return ORDER_API || '';
  }
  return ORDER_API || '';
};

// --- THE MAIN API CLIENT FUNCTION (WITH THE FIX) ---
const apiClient = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
) => {
  // ==========================================================
  //  THE FIX STARTS HERE
  // ==========================================================

  // Step A: Initialize headers as an empty object.
  const headers: HeadersInit = {};
  let bodyToSend: any = body;

  // Step B: Attach Authorization Token first.
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Step C: Intelligently decide the Content-Type.
  // If the body is a file upload (FormData), we DO NOT set the Content-Type header.
  // The browser needs to do this automatically to include the multipart boundary.
  if (!(body instanceof FormData)) {
    // If it's a regular object, we set the JSON header and stringify the body.
    headers['Content-Type'] = 'application/json';
    bodyToSend = body ? JSON.stringify(body) : undefined;
  }
  // If it IS FormData, we do nothing and let the browser handle it. `bodyToSend` is already correct.

  // ==========================================================
  //  THE FIX ENDS HERE - The rest of your code remains the same.
  // ==========================================================

  const cleanEndpoint = cleanEndpointPath(endpoint);
  const baseUrl = getBaseUrl(cleanEndpoint);
  const finalUrl = `${baseUrl}/${cleanEndpoint}`;

  try {
    const response = await fetch(finalUrl, {
      method,
      headers, // Use the intelligently created headers
      body: bodyToSend, // Use the correctly formatted body
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `API Error: ${response.status}`);
      } catch (jsonError) {
        throw new Error(`API Request Failed with status ${response.status}`);
      }
    }
    
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null; 
    }

    return await response.json();

  } catch (error) {
    console.error(`API Client Error [${method} ${cleanEndpoint}]:`, error);
    throw error;
  }
};

export default apiClient;