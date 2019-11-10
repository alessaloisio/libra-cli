const exec = require("child_process").exec;
const chalk = require("chalk");
const readline = require("readline");
const path = require("path");

const files = require("./files");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class Libra {
  constructor(library) {
    this.library = library;
    this.endPoint = "git@github.com:alessaloisio/libra-core.git";
    this.tmpDir = "tmp_libra-core";
    this.fullTmpDir = path.join(files.getCurrentDirectory(), this.tmpDir);

    // From where execute cmd
    this.execOptions = {
      cwd: this.fullTmpDir
    };
  }

  async init() {
    // Get libra-core
    await this.execSeq(
      `git clone ${this.endPoint} ${this.tmpDir}`,
      false,
      false
    );

    // Extract and get the library directory
    await this.prepareDirectory();

    // Open the libra.json
    const questions = JSON.parse(
      await files.readFile(path.join(this.fullTmpDir, "libra.json"))
    );

    const answers = await this.getAnswers(questions);

    // get ALL FILES FROM the tmpDir
    const tmpDirFiles = await files.getAllFrom(this.fullTmpDir);

    // replace all SELECTOR
    await this.replaceByAnswers(tmpDirFiles, answers);

    // rename tmpDir to nameLibrary
    if (typeof answers.name !== "undefined")
      await this.execSeq(`mv ${this.tmpDir} ${answers.name}`, false, false);
  }

  /**
   * Execute command with node
   * @param {string} cmd :cmd string command to be executed
   * @param {boolean} options :options use this.execOptions
   * @param {boolean} remove :remove remove tmp directory if error
   */
  execSeq(cmd, options = true, remove = true) {
    return new Promise(resolve => {
      exec(
        cmd,
        options ? this.execOptions : {},
        async (error, stdout, stderr) => {
          if (error) {
            if (remove) await exec(`rm -R ${this.tmpDir}`, false);
            console.error(chalk.red(`exec error: ${error}`));
            process.exit(1);
          }
          resolve(stdout ? stdout : stderr);
        }
      );
    });
  }

  /**
   * All sequences to prepare the tmp directory with the selected library
   */
  prepareDirectory() {
    // Source : https://gist.github.com/cyberang3l/6012c82266122e05db33f4cb8dcf598b
    const sequences = [
      "git remote rm origin",
      `git filter-branch --subdirectory-filter ${this.library} -- --all`,
      "git reset --hard",
      "git gc --aggressive",
      "git prune"
    ];

    return Promise.all(sequences.map(seq => this.execSeq(seq)));
  }

  /**
   * Ask all questions from libra.json
   * @param {object} questions :questions array regroup all questions to ask
   */
  getAnswers(questions) {
    // https://codereview.stackexchange.com/a/162791
    return new Promise((res, rej) => {
      let queue = Promise.resolve({});

      Object.keys(questions).map((key, i) => {
        queue = queue.then(
          answers =>
            new Promise((resolve, reject) => {
              rl.question(questions[key], reply => {
                answers[key] = reply;
                resolve(answers);
              });
            })
        );
      });

      queue.then(answers => {
        rl.close();
        res(answers);
      });
    });
  }

  /**
   * Read all files and replace selectors by answers
   * @param {array} allFiles :allFiles array regroup all path files
   * @param {object} answers :answers object with all answers from libra.json
   */
  async replaceByAnswers(allFiles, answers) {
    const buffers = allFiles.map(async path => files.readFile(path));

    // get all buffer files
    return Promise.all(buffers).then(completed => {
      completed.map(async (buffer, i) => {
        let strFile = buffer.toString();

        // Replace all answers
        Object.keys(answers).map(key => {
          const regex = new RegExp(`\\{\\[\\{${key}\\}\\]\\}`, "gm");
          strFile = strFile.replace(regex, answers[key]);
        });

        // save on file
        await files.promWriteFile(allFiles[i], strFile);
      });
    });
  }
}

module.exports = {
  Libra,
  rl
};
