const { bootstrap } = require("@kaholo/plugin-library");

const puppeteerService = require("./puppeteer-service");
const autocomplete = require("./autocomplete");

module.exports = bootstrap({
  runPuppeteerTest: puppeteerService.runPuppeteerTest,
  runCliCommand: puppeteerService.runPuppeteerCliCommand,
}, autocomplete);
