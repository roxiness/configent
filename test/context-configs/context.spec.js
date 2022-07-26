/** @type import('../../lib/configent')['configent'] */
let configent;

beforeAll(async () => {
  configent = await import("../../lib/configent.js").then((r) => r.configent);
});

const defaults = { fromContext: false };
const configentOptions = {
  useDetectDefaults: true,
  cacheConfig: false,
  cacheDetectedDefaults: false,
  consumerDir: __dirname,
  clientDir: __dirname,
};

test("if no context is found, defaults are unchanged", async () => {
  const result = await configent(configentOptions);
  assert.deepEqual(result, { });
});

test("if context is found, it sets defaults", async () => {
  process.env.USE_BASIC = "1";
  const result = await configent(configentOptions);
  assert.deepEqual(result, { fromContext: "basic" });
});

test("if multiple contexts are found, superseder wins", async () => {
  process.env.USE_SUPERSEDER = "1";
  const result = await configent(configentOptions);
  assert.deepEqual(result, { fromContext: "superseder" });
});

test("can read package.json from cwd", async () => {
  process.env.USE_PKGJSON = "1";
  const result = await configent(configentOptions);
  assert.deepEqual(result, { fromContext: "usepkgjson" });
});

// test("circular tests create error", async () => {
//   process.env.USE_CIRCULAR = "1";
//   const result = await configent(configentOptions);
//   assert.deepEqual(result, { fromContext: "usepkgjson" });
// });
