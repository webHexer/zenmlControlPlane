export const waitForZenML = async (callApi: () => Promise<any>) => {
  const maxRetries = 30;
  const delay = 2000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await callApi();

      if (res) {
        console.log("ZenML server is ready");
        return res;
      }
    } catch (error) {
      console.log("Waiting for ZenML server...");
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error("ZenML server failed to start");
};
