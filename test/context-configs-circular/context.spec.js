const test = require('ava').default
const { configent } = require('../..')
process.chdir(__dirname) //change cwd to __dirname

const defaults = { fromContext: false }
const configentOptions = {
    useDetectDefaults: true,
    cacheConfig: false
}

test('circular tests create error', async t => {

    const res = await t.try(() => {
        configent(defaults, {}, configentOptions)
    })
    res.discard()

    t.is(res.errors[0].savedError.message,
        `Looks like you have circular supersedings ` +
        `\ncircular1.config.js supersedes circular2` +
        `\ncircular2.config.js supersedes circular1`
    )
})
