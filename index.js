var loaderUtils = require("loader-utils");

function StripBlockLoader(content) {
  var options = loaderUtils.getOptions(this) || {};
  var platform = options.platform || 'browser';
  content = replaceModule(content, 'isomorphic-rest', 'isomorphic-rest/client')
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

function replaceModule(c, moduleName, destModulesName) {
  var es5 = new RegExp("require\\((\\'|\")" + moduleName + "(\\'|\")\\)", 'g');
  c = c.replace(es5, "require(\"" + destModulesName + "\")");
  return c;
}

function replace(c, words) {
  if (words.length === 0) return c;
  var word = words.shift();
  var regexPattern = new RegExp("[\\t ]*\\/\\/\\s*#?region\\s+" + word + " ?[\\s\\S]*?\\/\\/\\s*#?endregion ?[\\t ]*\\n?", "g")
  c = c.replace(regexPattern, '');
  return replace(c, words);
}

module.exports = StripBlockLoader;
