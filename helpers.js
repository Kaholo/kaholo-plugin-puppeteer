function buildEnvVarsParams(environmentVariables) {
  
    let argsArray = []
    for (const [key, value] of Object.entries(environmentVariables)) {
        argsArray.push(`-e "${key}=${value}"`);
    }
    return argsArray.join(" ");
  }

  module.exports = {
    buildEnvVarsParams,
  };
  