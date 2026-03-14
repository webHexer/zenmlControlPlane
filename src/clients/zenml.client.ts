export const zenmlRequest = async (
  url: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  body?: any,
  token?: string,
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: method !== "GET" && body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`ZenML API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`ZenML Client Error: ${error.message}`);
  }
};
