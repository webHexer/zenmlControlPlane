export const API_ENDPOINTS = {
  WORKSPACE_INFO: "/api/v1/info",
  ACTIVATE_WORKSPACE: "/api/v1/activate",
  CREATE_USER: "/api/v1/users",
  DELETE_USER: (zenmlUsername: string) => `/api/v1/users/${zenmlUsername}`,
  ACTIVATE_USER: (userId: string) => `/api/v1/users/${userId}/activate`,
  CREATE_SERVICE_USER: "/api/v1/service_accounts",
  DELETE_SERVICE_USER: (serviceUserId: string) =>
    `/api/v1/service_accounts/${serviceUserId}`,
  ACTIVATE_SERVICE_USER: (serviceUserId: string) =>
    `/api/v1/service_accounts/${serviceUserId}/api_keys`,
};
