export const ENDPOINTS = {
  WORKSPACE_INFO: "/api/v1/info",
  ACTIVATE_WORKSPACE: "/api/v1/activate",
  CREATE_USER: "/api/v1/users",
  ACTIVATE_USER: (userId: string) => `/api/v1/users/${userId}/activate`,
  CREATE_SERVICE_USER: "/api/v1/service_accounts",
  ACTIVATE_SERVICE_USER: (serviceUserId: string) =>
    `/api/v1/service_accounts/${serviceUserId}/api_keys`,
};
