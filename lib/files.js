const fs = require("fs");
const path = require("path");

module.exports = {
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd());
  },

  getCurrentDirectory: () => {
    return process.cwd();
  },

  directoryExists: filePath => {
    return fs.existsSync(filePath);
  },

  readFile: async path => {
    return new Promise((resolve, reject) => {
      fs.readFile(path, "utf8", (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }
};
