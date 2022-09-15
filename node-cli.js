const { docker } = require("@kaholo/plugin-library");
const {
  exec,
  assertPathExistence,
} = require("./helpers");
const {
  PUPPETEER_DOCKER_IMAGE,
  PUPPETEER_CLI_NAME,
} = require("./consts.json");

async function execute({ command, workingDirectory }) {

  const dockerCommandBuildOptions = {
    command: docker.sanitizeCommand(command, PUPPETEER_CLI_NAME),
    image: PUPPETEER_DOCKER_IMAGE,
  };

  await assertPathExistence(workingDirectory);
  const workingDirectoryVolumeDefinition = docker.createVolumeDefinition(workingDirectory);

  const dockerEnvironmentalVariables = {
    [workingDirectoryVolumeDefinition.mountPoint.name]: workingDirectoryVolumeDefinition.mountPoint.value,
  };
  let shellEnvironmentalVariables = {
    ...dockerEnvironmentalVariables,
    [workingDirectoryVolumeDefinition.path.name]: workingDirectoryVolumeDefinition.path.value,
  };

  const volumeDefinitionsArray = [workingDirectoryVolumeDefinition];
  dockerCommandBuildOptions.workingDirectory = workingDirectoryVolumeDefinition.mountPoint.value;

  dockerCommandBuildOptions.volumeDefinitionsArray = volumeDefinitionsArray;
  dockerCommandBuildOptions.environmentVariables = dockerEnvironmentalVariables;

  const dockerCommand = docker.buildDockerCommand(dockerCommandBuildOptions);

  const commandOutput = await exec(dockerCommand, {
    env: shellEnvironmentalVariables,
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
  execute,
};
