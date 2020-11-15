module.exports = {
    name: 'basic',
    condition: () => process.env.USE_BASIC,
    config: () => ({ fromContext: 'basic' })
}