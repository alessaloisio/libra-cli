const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const readline = require("readline");

const files = require("./lib/files");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// INIT HEADER
clear();
console.log(
  chalk.black.bgGreen(figlet.textSync("LIBRA", { horizontalLayout: "full" })),
  "\n\n"
);

// ASK QUESTIONS
rl.question(chalk.white.bold("LIBRAry name : "), name => {
  console.log(name);
});

// console.log(chalk.white.bold("Library description : "));
// console.log(chalk.white.bold("Library repo url : "));
