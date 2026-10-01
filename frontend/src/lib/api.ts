const API_URL = "http://localhost:4000/api";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // By default, include credentials for cookies (JWT)
  const defaultOptions: RequestInit = {
    credentials: "omit", // Wait, FastAPI backend sets cookie on response, but NextJS server components don't pass cookies automatically. Wait! The frontend needs to pass it or we use localStorage?
    // Let's use localStorage for token instead of cookies for simpler Next.js client/server sharing unless we use server actions.
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // If we have a token in localStorage, attach it
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    let errorMessage = "API Error";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }

  return response.json();
}
