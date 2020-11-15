module.exports = {
    name: 'Use package.json',
    supersedes: ['superseder'],
    condition: ({ pkgjson }) => (process.env.USE_PKGJSON && pkgjson.name === 'context-configs'),
    config: () => ({ fromContext: 'usepkgjson' })
}