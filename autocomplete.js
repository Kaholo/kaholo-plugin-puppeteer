const { promisify } = require("util");
const glob = promisify(require("glob"));
const path = require("path");

async function listJavaScriptFiles(query, { workingDirectory }) {
  const jsFiles = await glob("./**/*.js", {
    cwd: path.resolve(workingDirectory),
  });

  const mappedAutocompleteItems = jsFiles.map((filePath) => ({
    id: filePath,
    value: filePath,
  }));

  if (!query) {
    return mappedAutocompleteItems;
  }

  const lowerCaseQuery = query.toLowerCase();
  return mappedAutocompleteItems.filter(({ value }) => value.includes(lowerCaseQuery));
}

module.exports = {
  listJavaScriptFiles,
};
