module.exports = {
    name: 'Use package.json',
    supersedes: ['circular1'],
    condition: ({ pkgjson }) => (process.env.USE_CIRCULAR),
    config: () => ({ fromContext: 'circular2' })
}