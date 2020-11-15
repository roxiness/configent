const test = require('ava').default
const { configent } = require('../..')
process.chdir(__dirname) //change cwd to __dirname

const defaults = { fromContext: false }
const configentOptions = {
    useDetectDefaults: true,
    cacheConfig: false
}

test('if no context is found, defaults are unchanged', async t => {
    const result = configent(defaults, {}, configentOptions)
    t.deepEqual(result, { fromContext: false })
})

test('if context is found, it sets defaults', async t => {
    process.env.USE_BASIC = true
    const result = configent(defaults, {}, configentOptions)
    t.deepEqual(result, { fromContext: 'basic' })
})

test('if multiple contexts are found, superseder wins', async t => {
    process.env.USE_SUPERSEDER = true
    const result = configent(defaults, {}, configentOptions)
    t.deepEqual(result, { fromContext: 'superseder' })
})

test('can read package.json from cwd', async t => {
    process.env.USE_PKGJSON = true
    const result = configent(defaults, {}, configentOptions)
    t.deepEqual(result, { fromContext: 'usepkgjson' })
})

test('circular tests create error', async t => {
    process.env.USE_CIRCULAR = true
    const result = configent(defaults, {}, configentOptions)
    t.deepEqual(result, { fromContext: 'usepkgjson' })
})
