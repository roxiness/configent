/** @type import('../../lib/configent')['configent'] */
let configent;

beforeAll(async () => {
  configent = await import("../../lib/configent.js").then((r) => r.configent);
});

const configentOptions = {
  useDetectDefaults: true,
  cacheConfig: false,
  consumerDir: __dirname,
  clientDir: __dirname,
};

test("circular tests create error", async (t) => {
  let error;
  try {
    configent(configentOptions);
  } catch (err) {
    error = err;
  }

  assert.equal(
    error.message,
    `Looks like you have circular supersedings ` +
      `\ncircular1.config.js supersedes circular2` +
      `\ncircular2.config.js supersedes circular1`
  );
});
