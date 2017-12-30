var loaderUtils = require("loader-utils");

function StripBlockLoader(content) {
  var options = loaderUtils.getOptions(this) || {};
  var platform = options.platform || 'browser';

  if (platform === 'browser') {
    content = replace(content, ["backend", "nodejs", "node"]);
  } else {
    content = replace(content, ["browser", "dom", "client"]);
  }


  if (this.cacheable) {
    this.cacheable(true);
  }

  return content;
}

function replace(c, words) {
  if (words.length === 0) return c;
  var word = words.shift();
  var regexPattern = new RegExp("[\\t ]*\\/\\/\\s*#?region\\s+" + word + " ?[\\s\\S]*?\\/\\/\\s*#?endregion ?[\\t ]*\\n?", "g")
  c = c.replace(regexPattern, '');
  return replace(c, words);
}

module.exports = StripBlockLoader;
