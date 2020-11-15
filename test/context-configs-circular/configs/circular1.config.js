module.exports = {
    name: 'Use package.json',
    supersedes: ['circular2'],
    condition: ({ pkgjson }) => (process.env.USE_CIRCULAR),
    config: () => ({ fromContext: 'circular1' })
}