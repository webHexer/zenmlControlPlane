export const zenmlRequest = async (
  url: string,
  method: string,
  token?: string,
  body?: any,
) => {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ZenML API Error: ${errorText}`);
    }

    return await response.json();
  } catch (error: any) {
    // Normalize error
    throw new Error(`ZenML Client Error: ${error.message}`);
  }
};
