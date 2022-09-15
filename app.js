const kaholoPluginLibrary = require("@kaholo/plugin-library");
const { execute } = require("./node-cli");
const { runPuppeteerTestEnvVars } = require("./runPuppeteerTestEnvVars");
const { runPuppeteerTestParams } = require("./runPuppeteerTestParams");

module.exports = kaholoPluginLibrary.bootstrap({
  runCommand: execute,
  runPuppeteerTestEnvVars,
  runPuppeteerTestParams,
});
