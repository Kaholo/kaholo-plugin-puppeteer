const { bootstrap } = require("@kaholo/plugin-library");

const puppeteerService = require("./puppeteer-service");

module.exports = bootstrap({
  runPuppeteerTest: puppeteerService.runPuppeteerTest,
});
