/** @type import('../../lib/configent')['configent'] */
let configent;
const consumerDir = __dirname;
const clientDir = __dirname

beforeAll(async () => {
  configent = await import("../../lib/configent.js").then((r) => r.configent);
});

test("no env", async (t) => {
  const configentOptions = {
    useConfig: false,
    useDotEnv: false,
    useEnv: false,
    usePackageConfig: false,
    consumerDir,
    clientDir
  };
  const result = await configent(configentOptions);
  assert.deepEqual(result, {});
});

test("env", async (t) => {
  process.env["BASIC_fromEnv"] = "true";

  const result = await configent({ cacheConfig: false, consumerDir, clientDir });
  assert.deepEqual(result, {
    fromDotEnv: "true",
    fromEnv: "true",
    fromConfig: true,
    fromPackageJson: true,
  });
});
