interface ZenMLRequestParams {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  token?: string;
}
export const zenmlRequest = async ({
  url,
  method,
  body,
  token,
}: ZenMLRequestParams) => {
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
