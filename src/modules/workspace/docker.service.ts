import Docker from "dockerode";

const docker = new Docker();

let nextPort = 9001;

export const createZenMLInstance = async () => {
  const port = nextPort++;

  const container = await docker.createContainer({
    Image: "zenmldocker/zenml-server",

    name: `zenml-${port}`,

    ExposedPorts: {
      "8080/tcp": {},
    },

    HostConfig: {
      PortBindings: {
        "8080/tcp": [
          {
            HostPort: port.toString(),
          },
        ],
      },
    },
  });

  await container.start();

  return {
    containerId: container.id,
    url: `http://localhost:${port}`,
  };
};
