const exec = require("child_process").exec;
const chalk = require("chalk");
const readline = require("readline");

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

    // From where execute cmd
    this.seqOptions = {
      cwd: `${files.getCurrentDirectory()}/${this.tmpDir}`
    };
  }

  async clone() {
    // Get libra-core
    // await this.execSeq(
    //   `git clone ${this.endPoint} ${this.tmpDir}`,
    //   false,
    //   false
    // );

    // Extract and get the library directory
    // await this.prepareDirectory();

    // Open the libra.json
    const questions = JSON.parse(
      await files.readFile(
        `${files.getCurrentDirectory()}/${this.tmpDir}/libra.json`
      )
    );

    const answers = await this.getAnswers(questions);
    console.log(answers);

    // replace all SELECTOR on ALL FILES FROM the tmpDir
    const tmpDirFiles = await files.getAllFrom(
      `${files.getCurrentDirectory()}/${this.tmpDir}`
    );

    console.log(tmpDirFiles);

    // rename tmpDir to nameLibrary
  }

  execSeq(seq, options = true, remove = true) {
    return new Promise(resolve => {
      exec(
        seq,
        options ? this.seqOptions : {},
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
}

module.exports = {
  Libra,
  rl
};
