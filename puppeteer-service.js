const { docker } = require("@kaholo/plugin-library");
const { readFile } = require("fs/promises");
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
    puppeteerCaptureCommand,
    environmentalVariables = {},
  } = params;

  const absoluteWorkingDir = path.resolve(workingDirectory);
  if (!await pathExists(absoluteWorkingDir)) {
    throw new Error(`Path ${workingDirectory} does not exist on agent!`);
  }

  let commandToExecute;

  if (puppeteerCaptureCommand) {
    commandToExecute = sanitizeCaptureCommand(puppeteerCaptureCommand);
  } else {
    await analyzeTestFile(path.resolve(absoluteWorkingDir, puppeteerJSFile));

    const puppeteerCommand = `node ${puppeteerJSFile}`;
    commandToExecute = docker.buildDockerCommand({
      image: KAHOLO_PUPPETEER_IMAGE,
      command: docker.sanitizeCommand(puppeteerCommand),
      workingDirectory: "/project",
      environmentVariables: environmentalVariables,
      additionalArguments: [
        "-v",
        `${absoluteWorkingDir}:/project`,
      ],
    });
  }

  const commandOutput = await exec(commandToExecute, {
    env: {
      ...process.env,
      ...environmentalVariables,
    },
  });

  if (commandOutput.stderr && !commandOutput.stdout && !puppeteerCaptureCommand) {
    throw new Error(commandOutput.stderr);
  } else if (commandOutput.stderr) {
    console.error(commandOutput.stderr);
  }

  return commandOutput.stdout;
}

async function analyzeTestFile(filePath) {
  const fileContent = await readFile(filePath).then((contentBuffer) => contentBuffer.toString());
  if (!/require\(["'`]puppeteer["'`]\)/mg.test(fileContent)) {
    throw new Error("The specified file is not a JavaScript Puppeteer test");
  }
}

function sanitizeCaptureCommand(rawCommand) {
  const sanitizedCommand = rawCommand.replace(/^puppeteer(-cli)?/, "npx -y puppeteer-cli");
  return `bash -c ${JSON.stringify(sanitizedCommand)}`;
}

module.exports = {
  runPuppeteerTest,
};
