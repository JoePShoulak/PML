const parseColor = clr => hexToArray(clr).map(hex => parseInt(hex, 16) / 255);

const hexToArray = hex => [
  hex.substring(1, 3),
  hex.substring(3, 5),
  hex.substring(5, 7),
];

const regex = {
  generalTag: /<(\w+)((?:\s+\w+="[^"]*")*)>(.*?)<\/(\w+)>/g,
  styleTag: /<style>(.*?)<\/style>/g,
};

module.exports = { parseColor, regex };
