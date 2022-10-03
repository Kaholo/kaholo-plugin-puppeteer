const { bootstrap } = require("@kaholo/plugin-library");
const util = require("util");
const path = require("path");
const childProcess = require("child_process");
const { buildEnvironmentVariableArguments } = require("./helpers");

const exec = util.promisify(childProcess.exec);

const KAHOLO_PUPPETEER_IMAGE = "buildkite/puppeteer";

async function runPuppeteerTest(params) {
  const {
    puppeteerJSFile,
    workingDirectory,
    environmentalVariables = {},
  } = params;

  const envVarsParams = buildEnvironmentVariableArguments(environmentalVariables);

  const commandOutput = await exec(`\
docker run --rm \
${envVarsParams} \
-v ${path.resolve(workingDirectory)}:/project \
-w /project \
${KAHOLO_PUPPETEER_IMAGE} \
node ${puppeteerJSFile}\
`, {
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

module.exports = bootstrap({
  runPuppeteerTest,
});
