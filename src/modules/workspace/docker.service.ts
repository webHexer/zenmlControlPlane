import Docker from "dockerode";
import { exec } from "child_process";
import { promisify } from "util";

const docker = new Docker();

let nextPort = 9001;

const execAsync = promisify(exec);

export const destroyZenMLInstance = async (containerId: string) => {
  try {
    await execAsync(`docker stop ${containerId}`);
    await execAsync(`docker rm ${containerId}`);
  } catch (error) {
    console.error("Failed to destroy container:", containerId, error);
  }
};

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
