const { parseColor, regex } = require("./helper");
const defaults = require("./defaults.json");
const types = Object.keys(defaults);

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

const preprocessPML = text =>
  text
    .replace(/\s+/g, " ")
    .replace(/ >/g, ">")
    .replace(/<!--.*?-->/gs, "");

const convertToPlasmaUI = attrs => {
  if (!attrs.type) return console.log("unreognized type");
  const type = attrs.type;

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

  const style = { text: { x: 2, y: 3 } };
  const styled = { ...defaults };

  if (style)
    Object.entries(style).forEach(([type, attr]) => {
      styled[type] = { ...styled[type], ...attr };
    });

  return { ...defaults[type], ...attrs };
};

const splitTags = tagString =>
  tagString
    .trim()
    .split(" ")
    .filter(s => s);

const getAttributes = tagMatch => {
  const [openTag, closeTag] = [tagMatch[1], tagMatch[4]];
  if (openTag !== closeTag)
    return console.error(
      `Mismatching tag error: '${openTag}' != '${closeTag}'`
    );
  if (!types.includes(openTag))
    return console.error(`Unknown tag error: '${openTag}'`);

  const attrObj = { type: openTag, text: tagMatch[3].trim() };

  splitTags(tagMatch[2]).forEach(attrStr => {
    const attrArr = attrStr.split("=");
    attrObj[attrArr[0]] = attrArr[1].replace(/"/g, "");
  });

  return attrObj;
};

const parsePML = pml => {
  pml = preprocessPML(pml);

  const style = JSON.parse(regex.styleTag.exec(pml)[1]);
  pml = pml.replace(regex.styleTag, "");

  let tagMatch;
  const plasmaUI = [];
  while ((tagMatch = regex.generalTag.exec(pml))) {
    const attrs = getAttributes(tagMatch);
    if (attrs) plasmaUI.push(convertToPlasmaUI(attrs));
  }

  return plasmaUI;
};

module.exports = { parsePML };
