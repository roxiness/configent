module.exports = {
    name: 'Superseder',
    supersedes: ['basic'],
    condition: () => process.env.USE_SUPERSEDER,
    config: () => ({ fromContext: 'superseder' })
}