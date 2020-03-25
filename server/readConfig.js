const path = require("path");

module.exports = function readConfig() {
  const configPaths = ["config.js", "config.json"];

  for (const currentPath of configPaths) {
    try {
      const configPath = path.resolve(__dirname, "..", currentPath);
      console.log({ currentPath, __dirname, configPath });
      const config = require(configPath);
      if (!config) {
        continue;
      }
      return config;
    } catch (e) {
      console.log({ e });
    }
  }
  throw Error("no config file specified");
};
