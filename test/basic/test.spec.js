

const test = require('ava').default
const { configent } = require('../..')
process.chdir(__dirname)


test('no env', async t => {
    const configentOptions = {
        useConfig: false,
        useDotEnv: false,
        useEnv: false,
        usePackageConfig: false
    }
    const defaults = { bar: 123, baz: 456 }
    const result = configent(defaults, {}, configentOptions)
    t.deepEqual(result, defaults)
})

test('env', async t => {
    console.log('cwd2', process.cwd())
    process.env['BASIC_fromEnv'] = 'true'
    const defaults = {
        fromDefaults: true,
        fromDotEnv: false,
        fromEnv: false,
        fromOptions: false,
        fromConfig: false,
        fromPackageJson: false,
    }
    const options = { fromOptions: true }
    const result = configent(defaults, options)
    t.deepEqual(result, {
        fromDefaults: true,
        fromDotEnv: 'true',
        fromEnv: 'true',
        fromConfig: true,
        fromPackageJson: true,
        fromOptions: true,
    })
})
