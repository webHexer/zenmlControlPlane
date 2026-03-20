export const generateValuesYaml = (workspace: string) => `
workspace: ${workspace}

image:
  repository: zenmldocker/zenml-server
  tag: latest

service:
  port: 80
  targetPort: 8080
`;