const fs = require("fs"),
  path = require("path"),
  util = require("util"),
  readDir = util.promisify(fs.readdir),
  statP = util.promisify(fs.stat);

const getCurrentDirectoryBase = () => {
  return path.basename(process.cwd());
};

const getCurrentDirectory = () => {
  return process.cwd();
};

const directoryExists = filePath => {
  return fs.existsSync(filePath);
};

/**
 * Get buffer of a specific file
 * @param {string} path :path file
 */
const readFile = path => {
  return new Promise((resolve, reject) => {
    let readStream = fs.createReadStream(path);
    let chunks = [];

    readStream.on("error", err => {
      reject(err);
    });

    readStream.on("data", chunk => {
      chunks.push(chunk);
    });

    // File is done being read
    readStream.on("close", () => {
      resolve(Buffer.concat(chunks));
    });
  });
};

const analyseAllFrom = (dir, allFiles = {}) => {
  return new Promise(async (resolve, reject) => {
    const files = await readDir(dir);

    await Promise.all(
      files.map(async f => {
        const fDir = path.join(dir, f);

        console.log(fDir);

        if ((await statP(fDir)).isDirectory()) {
          allFiles[f] = await analyseAllFrom(fDir, allFiles[f]);
        } else {
          allFiles[f] = await readFile(fDir);
        }
      })
    );

    resolve(allFiles);
  });
};

module.exports = {
  getCurrentDirectoryBase,
  getCurrentDirectory,
  directoryExists,
  readFile,
  analyseAllFrom
};
