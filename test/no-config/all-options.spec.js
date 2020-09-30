

const test = require('ava').default
const {configent} = require('../..')

test('no config + env', async t => {
    console.log('cwd2', process.cwd())
    process.env.FOO_fromEnv = 'true'
    const defaults = { 
        fromDefaults: true,
        fromDotEnv: false,
        fromEnv: false,
        fromOptions: false,
        fromConfig: false,
        fromPackageJson: false,
    }
    const options = {fromOptions: true}
    const result = configent('foo', defaults, options)
    t.deepEqual(result, { 
        fromDefaults: true,
        fromDotEnv: 'true',
        fromEnv: 'true',
        fromConfig: true,
        fromPackageJson: true,
        fromOptions: true,
     })
})
