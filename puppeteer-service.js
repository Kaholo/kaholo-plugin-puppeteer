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
    environmentVariables = {},
  } = params;

  const absoluteWorkingDir = path.resolve(workingDirectory || "");
  if (!await pathExists(absoluteWorkingDir)) {
    throw new Error(`Path ${workingDirectory} does not exist on agent!`);
  }

  await analyzeTestFile(path.resolve(absoluteWorkingDir, puppeteerJSFile));
  const puppeteerCommand = docker.sanitizeCommand(`node ${puppeteerJSFile}`);

  return runCommandInDocker({
    environmentVariables,
    command: puppeteerCommand,
    workingDirectory: absoluteWorkingDir,
  });
}

async function runPuppeteerCliCommand(params) {
  const {
    puppeteerCommand,
    workingDirectory,
  } = params;

  const absoluteWorkingDir = path.resolve(workingDirectory || "");
  if (!await pathExists(absoluteWorkingDir)) {
    throw new Error(`Path ${workingDirectory} does not exist on agent!`);
  }

  return runCommandInDocker({
    command: customSanitizeCommand(puppeteerCommand),
    workingDirectory: absoluteWorkingDir,
    isCliCommand: true,
  });
}

async function runCommandInDocker(params) {
  const {
    command,
    environmentVariables,
    workingDirectory,
    isCliCommand = false,
    buildCommandOptions = {},
  } = params;

  const commandToExecute = docker.buildDockerCommand({
    command,
    image: KAHOLO_PUPPETEER_IMAGE,
    workingDirectory: "/project",
    environmentVariables,
    additionalArguments: [
      "-v",
      `${workingDirectory}:/project`,
    ],
    ...buildCommandOptions,
  });

  const commandOutput = await exec(commandToExecute, {
    env: {
      ...process.env,
      ...environmentVariables,
    },
  });

  if (commandOutput.stderr && !commandOutput.stdout && !isCliCommand) {
    throw new Error(commandOutput.stderr);
  } else if (commandOutput.stderr) {
    console.error(commandOutput.stderr);
  }

  return commandOutput.stdout;
}

async function analyzeTestFile(filePath) {
  const fileContent = await readFile(filePath).then((contentBuffer) => contentBuffer.toString());
  if (!/require\(["'`]puppeteer["'`]\)/mg.test(fileContent)) {
    throw new Error("The specified file is not a JavaScript Puppeteer test, it does not import \"puppeteer\" package");
  }
}

function customSanitizeCommand(rawCommand) {
  const puppeteerInstallCommand = "npm -g install puppeteer-cli --unsafe-perm=true";
  const sanitizedCommand = rawCommand.replace(/^puppeteer(-cli)?/, "puppeteer");

  return `bash -c ${JSON.stringify(`${puppeteerInstallCommand} && ${sanitizedCommand}`)}`;
}

module.exports = {
  runPuppeteerTest,
  runPuppeteerCliCommand,
};
