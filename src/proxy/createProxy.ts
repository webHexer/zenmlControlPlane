import { createProxyMiddleware } from "http-proxy-middleware";

export const createZenProxy = (target: string, token: string) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    secure: false,
    ws: true,
    on: {
      proxyReq: (proxyReq, req: any) => {
        proxyReq.setHeader("Authorization", `Bearer ${token}`);

        if (req.body) {
          const bodyData = JSON.stringify(req.body);

          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));

          proxyReq.write(bodyData);
        }
      },
    },
  });
};
