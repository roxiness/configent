const { existsSync } = require('fs')
const { resolve } = require('path')
let instances = {}
const _defaults = {
    singleton: true,
    useDotEnv: true,
    useEnv: true,
    usePackageConfig: true,
    useConfig: true,
    sanitizeEnvValue: str => str.replace(/[-_][a-z]/g, str => str.substr(1).toUpperCase())
}

/**
 * 
 * @param {string} name 
 * @param {Object.<string, *>} defaults 
 * @param {Object.<string, *>=} options
 * @param {Partial<_defaults>=} _options
 */
function configent(name, defaults, options = {}, _options) {
    _options = { ..._defaults, ..._options }
    const {
        singleton,
        useDotEnv,
        sanitizeEnvValue,
        useConfig,
        useEnv,
        usePackageConfig
    } = _options

    const configPath = resolve(process.cwd(), `${name}.config.js`)
    const upperCaseRE = new RegExp(`^${name.toUpperCase()}_`)
    const hash = JSON.stringify({ name, defaults, options })

    if (!instances[hash] || !singleton) {
        instances[hash] = {
            ...defaults,
            ...usePackageConfig && getPackageConfig(),
            ...useConfig && getUserConfig(configPath),
            ...useEnv && getEnvConfig(),
            ...options
        }
    }
    return instances[hash]

    function getEnvConfig() {
        useDotEnv && require('dotenv').config()
        const entries = Object.entries(process.env)
            .filter(([key]) => key.match(upperCaseRE))
            .map(parseField)

        if (entries.length)
            return entries.reduce((prev, { key, value }) => ({ ...prev, [key]: value }), {})

        function parseField([key, value]) {
            console.log({ key, value })
            const shouldParseValue = k => typeof defaults[k] === 'object'

            key = sanitizeEnvValue(key.replace(upperCaseRE, ''))
            value = shouldParseValue(key) ? JSON.parse(value) : value
            return { key, value }
        }
    }

    function getUserConfig(path) {
        return existsSync(path) ? require(path) : {}
    }

    function getPackageConfig() {
        const path = resolve(process.cwd(), 'package.json')
        return existsSync(path) && require(path)[name]
    }
}

module.exports = { configent }