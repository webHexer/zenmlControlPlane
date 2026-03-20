import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// 👉 CHANGE THIS PATH
const REPO_PATH = "/Users/ayushgupta/Desktop/Projects/ZenML/gitops";

const runGitCommand = async (command: string) => {
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: REPO_PATH,
    });

    if (stdout) console.log("GIT STDOUT:", stdout);
    if (stderr) console.error("GIT STDERR:", stderr);
  } catch (error: any) {
    console.error("Git command failed:", command);
    console.error(error?.stderr || error);
    throw error;
  }
};

export const pushWorkspaceToGit = async (
  workspace: string,
  valuesYaml: string,
) => {
  try {
    const workspaceDir = path.join(REPO_PATH, "workspaces", workspace);

    if (!fs.existsSync(workspaceDir)) {
      fs.mkdirSync(workspaceDir, { recursive: true });
    }

    // Only push values.yaml — no Chart.yaml, no subchart wrapper
    fs.writeFileSync(path.join(workspaceDir, "values.yaml"), valuesYaml);

    await runGitCommand("git add .");

    try {
      await runGitCommand(`git commit -m "workspace ${workspace} created"`);
    } catch {
      console.log("Nothing to commit, skipping...");
    }

    await runGitCommand("git push");

    console.log(`Workspace ${workspace} pushed to GitOps repo`);
  } catch (error) {
    console.error("Failed to push workspace to Git:", error);
    throw error;
  }
};
