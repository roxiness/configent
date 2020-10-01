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
 * @template {Object.<string, any>} options
 * @param {string} name name to use for configs
 * @param {options} defaults default options 
 * @param {Partial<options>=} input provided input
 * @param {object} [configentOptions ] configent options
 * @param {boolean} [configentOptions.singleton = true] calling configent twice with same parameters will return the same instance
 * @param {boolean} [configentOptions.useDotEnv = true] include config from .env files
 * @param {boolean} [configentOptions.useEnv = true] include config from process.env
 * @param {boolean} [configentOptions.usePackageConfig = true] include config from package.json
 * @param {boolean} [configentOptions.useConfig = true] include config from [name].config.js
 * @param {function} [configentOptions.sanitizeEnvValue = str => str.replace(/[-_][a-z]/g, str => str.substr(1).toUpperCase())] sanitize environment values. Convert snake_case to camelCase by default. 
 * @returns {options}
 */
function configent(name, defaults, input = {}, configentOptions) {
    configentOptions = { ..._defaults, ...configentOptions }
    const {
        singleton,
        useDotEnv,
        sanitizeEnvValue,
        useConfig,
        useEnv,
        usePackageConfig
    } = configentOptions

    const configPath = resolve(process.cwd(), `${name}.config.js`)
    const upperCaseRE = new RegExp(`^${name.toUpperCase()}_`)
    const hash = JSON.stringify({ name, defaults, options: input })

    if (!instances[hash] || !singleton) {
        instances[hash] = {
            ...defaults,
            ...usePackageConfig && getPackageConfig(),
            ...useConfig && getUserConfig(configPath),
            ...useEnv && getEnvConfig(),
            ...input
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