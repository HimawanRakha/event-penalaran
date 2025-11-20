// src/utils/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export const fetchAPI = async (path: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${path}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  let body = options.body;
  if (body && typeof body === "object" && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    body,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          try {
            const errorJson = JSON.parse(errorBody);
            errorMessage = errorJson.message || errorJson.error || errorBody;
          } catch {
            errorMessage = errorBody;
          }
        }
      } catch {
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Tidak dapat terhubung ke backend di ${url}. Pastikan backend JSP berjalan di ${BASE_URL}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error("Response dari server tidak valid. Pastikan backend berjalan dengan benar.");
    }
    throw error;
  }
};
