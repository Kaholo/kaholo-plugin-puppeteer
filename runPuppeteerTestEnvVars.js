const {
  exec,
  assertPathExistence,
} = require("./helpers");

async function runPuppeteerTestEnvVars({ puppeteerJSFile, workingDirectory, environmentVars }) {

  const NODE_COMMAND = "node";
  let commands = [];

  if (typeof(workingDirectory) !== "undefined") {
    await assertPathExistence(workingDirectory);
    commands.push(`cd ${workingDirectory}`);
  }

  commands.push(`${NODE_COMMAND} ${puppeteerJSFile}`);

  const fullCommand = commands.join("; ");

  const commandOutput = await exec(fullCommand, {
    env: environmentVars,
  }).catch((error) => {
    throw new Error(error.stderr || error.stdout || error.message || error);
  });

  if (commandOutput.stderr && !commandOutput.stdout) {
    throw new Error(commandOutput.stderr);
  } else if (commandOutput.stdout) {
    console.error(commandOutput.stderr);
  }

  return commandOutput.stdout;
}

module.exports = {
  runPuppeteerTestEnvVars,
};
