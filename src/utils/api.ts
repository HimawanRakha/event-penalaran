// src/utils/api.ts

// Mengambil URL dari .env, atau default ke localhost:8080
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

/**
 * Fungsi Helper untuk melakukan Fetch ke Spring Boot
 * @param path - Endpoint (contoh: "/api/events")
 * @param options - Opsi fetch standar (method, body, headers)
 */
export const fetchAPI = async (path: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${path}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    // Nanti bisa tambah Authorization header di sini jika sudah ada login
  };

  // Jika ada body, pastikan di-stringify jika belum
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

    // Jika Backend mati atau error
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          // Coba parse sebagai JSON, jika gagal gunakan sebagai string
          try {
            const errorJson = JSON.parse(errorBody);
            errorMessage = errorJson.message || errorJson.error || errorBody;
          } catch {
            errorMessage = errorBody;
          }
        }
      } catch {
        // Jika tidak bisa membaca error body, gunakan default message
      }
      throw new Error(errorMessage);
    }

    // Jika response kosong (204 No Content), return null
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null;
    }

    // Cek content-type untuk memastikan response adalah JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      // Jika bukan JSON, baca sebagai text
      const text = await response.text();
      // Coba parse sebagai JSON, jika gagal return text
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
  } catch (error) {
    // Jika error adalah network error (backend tidak berjalan)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Tidak dapat terhubung ke backend di ${url}. Pastikan backend JSP berjalan di ${BASE_URL}`);
    }
    // Jika error adalah JSON parse error
    if (error instanceof SyntaxError) {
      throw new Error("Response dari server tidak valid. Pastikan backend berjalan dengan benar.");
    }
    throw error;
  }
};
