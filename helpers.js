const fs = require("fs");
const { access } = require("fs/promises");
const { promisify } = require("util");
const { exec: execWithCallback } = require("child_process");

const exec = promisify(execWithCallback);

async function pathExists(path) {
  try {
    await access(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  pathExists,
  exec,
};
