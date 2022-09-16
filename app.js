const { bootstrap, docker } = require("@kaholo/plugin-library");
const util = require("util");
const path = require("path");
const childProcess = require("child_process");
const { buildEnvVarsParams } = require("./helpers");

const exec = util.promisify(childProcess.exec);

const KAHOLO_PUPPETEER_IMAGE = "buildkite/puppeteer";

async function runPuppeteerTest(params) {
  const {
    puppeteerJSFile,
    workingDirectory,
    environmentalVariables = {},
  } = params;

  console.error(JSON.stringify(environmentalVariables));

  const envVarsParams = buildEnvVarsParams(environmentalVariables);

  console.error(envVarsParams);

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

runPuppeteerTestParams
async function runPuppeteerTestParams(params) {
  const {
    puppeteerJSFile,
    workingDirectory,
    kaholoURL,
    kaholoUsername,
    kaholoPassword,
  } = params;

  let environmentalVariables = {
    "KAHOLO_URL": kaholoURL,
    "KAHOLO_USERNAME": kaholoUsername,
    "KAHOLO_PASSWORD": kaholoPassword
  }

  const envVarsParams = buildEnvVarsParams(environmentalVariables);

  console.error(envVarsParams);

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
  runPuppeteerTestParams,
});
