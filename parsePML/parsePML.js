const { parseColor, regex } = require("./helper");
const defaults = require("./defaults.json");
const types = Object.keys(defaults);

const rgb = ["R", "G", "B"];
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

const preprocessPML = pml =>
  pml
    .replace(/\s+/g, " ") // Collapse consecutive whitespace to just spaces
    .replace(/ >/g, ">") // Remove remaining whitespace around tags
    .replace(/<!--.*?-->/gs, ""); // Remove HTML-style commends from the code

const convertToPlasmaUI = (attrs, style) => {
  if (!attrs.type) return console.error(`Missing type error`);
  const type = attrs.type;

  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "text" && value === "") {
      attrs.text = defaults[type].text;
    } else if (Object.keys(numMap).includes(key)) {
      attrs[key] = numMap[key][value];
    } else if (value[0] === "#") {
      parseColor(value).forEach((clr, i) => (attrs[key + rgb[i]] = clr));
      delete attrs[key];
    } else {
      const pV = parseInt(value);
      attrs[key] = !isNaN(pV) ? pV : attrs[key];
    }
  });

  const styled = { ...defaults };

  if (style)
    Object.entries(style).forEach(
      ([type, attr]) => (styled[type] = { ...styled[type], ...attr })
    );

  return { ...styled[type], ...attrs };
};

const splitTags = tagString =>
  tagString
    .trim()
    .split(" ")
    .filter(s => s);

const getAttributes = tagMatch => {
  const [openTag, closeTag] = [tagMatch[1], tagMatch[4]];
  if (openTag !== closeTag)
    return console.error(`Tag mismatch error: '${openTag}' != '${closeTag}'`);
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
  Object.entries(style).forEach(
    ([k, v]) => (style[k] = convertToPlasmaUI({ ...v, type: k }))
  );

  pml = pml.replace(regex.styleTag, "");

  let tagMatch;
  const plasmaUI = [];
  while ((tagMatch = regex.generalTag.exec(pml))) {
    const attrs = getAttributes(tagMatch);
    if (attrs) plasmaUI.push(convertToPlasmaUI(attrs, style)); // commented out until styling is fixed
  }

  return plasmaUI;
};

module.exports = { parsePML };
