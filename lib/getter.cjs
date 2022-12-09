module.exports.require = (path) => {
  try {
    // console.log("plain import", path);
    return require(path);
  } catch (err) {
    if (err.code !== "ERR_REQUIRE_ESM") throw err;
    else
      try {
        // console.log("esm import", path);
        return require("esm")(module)(path).default;
      } catch (err) {
        console.log('failed to import', path)
        console.log('try renaming the file to *.cjs or *.mjs')
        throw err
      }
  }
};
