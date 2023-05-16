const stripWhitespace = text => text.replace(/\s+/g, " ").replace(/ >/g, ">");

module.exports = { stripWhitespace };
