const fs = require("fs"),
  path = require("path"),
  util = require("util");

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
 * @param {string} pathFile :pathFile file
 */
const readFile = pathFile => {
  return new Promise((resolve, reject) => {
    let readStream = fs.createReadStream(pathFile);
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

const readDir = util.promisify(fs.readdir);
const statP = util.promisify(fs.stat);

/**
 * Get recursively all files path from a specific directory
 * @param {string} pathDir :pathDir path directory
 * @param {array} allFiles :allFiles array regroup all path files
 */
const getAllFrom = (pathDir, allFiles = []) => {
  return new Promise(async (resolve, reject) => {
    const files = await readDir(pathDir);

    await Promise.all(
      files.map(async f => {
        const fullPath = path.join(pathDir, f);

        if ((await statP(fullPath)).isDirectory()) {
          if (f !== ".git") {
            allfiles = allFiles.concat(await getAllFrom(fullPath, allFiles));
          }
        } else allFiles.push(fullPath);
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
  getAllFrom
};
