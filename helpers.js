const _ = require("lodash/fp");

function buildEnvironmentVariableArguments(environmentVariables) {
  if (
    !environmentVariables
    || !_.isObject(environmentVariables)
    || _.isArray(environmentVariables)
  ) {
    throw new Error("environmentVariables parameter must be an object.");
  }

  return Object.entries(environmentVariables)
    .reduce(
      (acc, [name]) => `${acc}-e ${name} `,
      "",
    ).trim();
}

module.exports = {
  buildEnvironmentVariableArguments,
};
