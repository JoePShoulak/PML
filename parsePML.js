const { stripWhitespace } = require("./helpers/help");

const numMap = {
  horizontalAlignment: {
    left: 0,
    center: 1,
    right: 2,
  },
  verticalAlignment: {
    top: 0,
    center: 1,
    bottom: 2,
  },
  type: {
    text: 1,
    button: 2,
  },
};

const rgb = ["R", "G", "B"];

const hexToArray = hex => [
  hex.substring(1, 3),
  hex.substring(3, 5),
  hex.substring(5, 7),
];

const parseColor = clr => hexToArray(clr).map(hex => parseInt(hex, 16) / 255);

const convertToPlasmaUI = attrs => {
  Object.entries(attrs).forEach(([key, value]) => {
    if (Object.keys(numMap).includes(key)) {
      attrs[key] = numMap[key][value];
    } else if (value[0] === "#") {
      parseColor(value).forEach((clr, i) => (attrs[key + rgb[i]] = clr));
      delete attrs[key];
    } else {
      const pV = parseInt(value);
      attrs[key] = !isNaN(pV) ? pV : attrs[key];
    }
  });

  return attrs;
};

const splitTags = tagString =>
  tagString
    .trim()
    .split(" ")
    .filter(s => s);

const getAttributes = tagMatch => {
  const [openTag, closeTag] = [tagMatch[1], tagMatch[4]];
  if (openTag !== closeTag) return console.error("Mismatching tag error");

  const attrObj = { type: openTag, text: tagMatch[3].trim() };

  splitTags(tagMatch[2]).forEach(attrStr => {
    const attrArr = attrStr.split("=");
    attrObj[attrArr[0]] = attrArr[1].replace(/"/g, "");
  });

  return attrObj;
};

const parsePML = pml => {
  const pattern = /<(\w+)((?:\s+\w+="[^"]*")*)>(.*?)<\/(\w+)>/g;

  let tagMatch;
  const plasmaUI = [];
  while ((tagMatch = pattern.exec(stripWhitespace(pml))))
    plasmaUI.push(convertToPlasmaUI(getAttributes(tagMatch)));

  return plasmaUI;
};

module.exports = { parsePML };
