const { docker } = require("@kaholo/plugin-library");
const path = require("path");

const {
  pathExists,
  exec,
} = require("./helpers");

const KAHOLO_PUPPETEER_IMAGE = "buildkite/puppeteer";

async function runPuppeteerTest(params) {
  const {
    puppeteerJSFile,
    workingDirectory,
    environmentalVariables = {},
  } = params;

  const absoluteWorkingDir = path.resolve(workingDirectory);
  if (!await pathExists(absoluteWorkingDir)) {
    throw new Error(`Path ${workingDirectory} does not exist on agent!`);
  }

  const puppeteerCommand = `node ${puppeteerJSFile}`;
  const dockerCommand = docker.buildDockerCommand({
    image: KAHOLO_PUPPETEER_IMAGE,
    command: docker.sanitizeCommand(puppeteerCommand),
    workingDirectory: "/project",
    environmentVariables: environmentalVariables,
    additionalArguments: [
      "-v",
      `${absoluteWorkingDir}:/project`,
    ],
  });

  const commandOutput = await exec(dockerCommand, {
    env: {
      ...process.env,
      ...environmentalVariables,
    },
  });

  if (commandOutput.stderr && !commandOutput.stdout) {
    throw new Error(commandOutput.stderr);
  } else if (commandOutput.stderr) {
    console.error(commandOutput.stderr);
  }

  return commandOutput.stdout;
}

module.exports = {
  runPuppeteerTest,
};
