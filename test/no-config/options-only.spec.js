const test = require('ava').default
const { configent } = require('../..')

const configentOptions = {
    useConfig: false,
    useDotEnv: false,
    useEnv: false,
    usePackageConfig: false
}

test('no config - no env', async t => {
    const defaults = { bar: 123, baz: 456 }
    const result = configent('foo', defaults, {}, configentOptions)
    t.deepEqual(result, defaults)
})