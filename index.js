#!/usr/bin/env node

const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");

const core = require("./lib/core"),
  Libra = core.Libra,
  rl = core.rl;

// INIT HEADER
clear();
console.log(
  chalk.black.bgGreen(figlet.textSync("LIBRA", { horizontalLayout: "full" })),
  "\n\n"
);

// ASK FIRST QUESTIONS
rl.question("What kind of Library do you want to clone (js, ..) : ", answer => {
  const library = new Libra(answer);
  library.init();
});
