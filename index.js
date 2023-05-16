const fs = require("fs");
const { parsePML } = require("./parsePML");

fs.readFile("samples/textAndButton.pml", "utf8", (err, data) => {
  if (err) return console.error(err);

  const plasmaUI = parsePML(data);
  console.log(plasmaUI);
});

const s = ["a", "", "c"];
