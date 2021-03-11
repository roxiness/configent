const { existsSync, readdirSync } = require('fs')
const { resolve, dirname } = require('path')
let instances = {}
let detectedFromDefaults = {}

const _defaults = {
    name: '',
    cacheConfig: true,
    cacheDetectedDefaults: true,
    useDotEnv: true,
    useEnv: true,
    usePackageConfig: true,
    useConfig: true,
    useDetectDefaults: false,
    detectDefaultsConfigPath: 'configs',
    sanitizeEnvValue: str => str.replace(/[-_][a-z]/g, str => str.substr(1).toUpperCase())
}

/**
 * @template {Object.<string, any>} options
 * @param {options} defaults default options 
 * @param {Partial<options>=} input provided input
 * @param {object} [configentOptions] configent options
 * @param {string=} [configentOptions.name = ''] name to use for configs. If left empty, name from package.json is used
 * @param {boolean=} [configentOptions.cacheConfig = true] calling configent twice with same parameters will return the same instance
 * @param {boolean=} [configentOptions.cacheDetectedDefaults = true] calling configent twice from the same module will return the same defaults
 * @param {boolean=} [configentOptions.useDotEnv = true] include config from .env files
 * @param {boolean=} [configentOptions.useEnv = true] include config from process.env
 * @param {boolean=} [configentOptions.usePackageConfig = true] include config from package.json
 * @param {boolean=} [configentOptions.useConfig = true] include config from [name].config.js
 * @param {boolean=} [configentOptions.useDetectDefaults = true] detect defaults from context (package.json and file stucture)
 * @param {string=} [configentOptions.detectDefaultsConfigPath = 'configs'] detect defaults from context (package.json and file stucture)
 * @param {function=} [configentOptions.sanitizeEnvValue = str => str.replace(/[-_][a-z]/g, str => str.substr(1).toUpperCase())] sanitize environment values. Convert snake_case to camelCase by default. 
 * @param {NodeModule} [configentOptions.module] required if multiple modules are using configent
 * @returns {options}
 */
function configent(defaults, input = {}, configentOptions) {
    configentOptions = { ..._defaults, ...configentOptions }
    const getParentModuleDir = createGetParentModuleDir(configentOptions)
    configentOptions.name = configentOptions.name || require(resolve(getParentModuleDir(), 'package.json')).name

    const {
        name,
        cacheConfig,
        cacheDetectedDefaults,
        useDotEnv,
        sanitizeEnvValue,
        useConfig,
        useEnv,
        usePackageConfig,
        useDetectDefaults,
        detectDefaultsConfigPath
    } = configentOptions
    const upperCaseRE = new RegExp(`^${name.toUpperCase()}_`)

    return buildConfig()

    function buildConfig() {
        delete (configentOptions.module)
        const hash = JSON.stringify({ name, defaults, input, configentOptions })
        if (!instances[hash] || !cacheConfig) {
            instances[hash] = {
                ...defaults,
                ...useDetectDefaults && getDetectDefaults(),
                ...usePackageConfig && getPackageConfig(),
                ...useConfig && getUserConfig(),
                ...useEnv && getEnvConfig(),
                ...input
            }
        }
        return instances[hash]
    }

    function getEnvConfig() {
        useDotEnv && require('dotenv').config()
        const entries = Object.entries(process.env)
            .filter(([key]) => key.match(upperCaseRE))
            .map(parseField)

        if (entries.length)
            return entries.reduce((prev, { key, value }) => ({ ...prev, [key]: value }), {})

        function parseField([key, value]) {
            const shouldParseValue = k => typeof defaults[k] === 'object'

            key = sanitizeEnvValue(key.replace(upperCaseRE, ''))
            value = shouldParseValue(key) ? JSON.parse(value) : value
            return { key, value }
        }
    }

    function getUserConfig() {
        const path = resolve(process.cwd(), `${name}.config.js`)
        return existsSync(path) ? require(path) : {}
    }

    function getPackageConfig() {
        const path = resolve(process.cwd(), 'package.json')
        return existsSync(path) && require(path)[name]
    }

    function getDetectDefaults() {
        const hash = JSON.stringify({ name, path: module['parent'].path })

        // we only want to detect the defaults for any given module once
        if (!detectedFromDefaults[hash] || !cacheDetectedDefaults) {
            const pkgjson = { dependencies: {}, devDependencies: {} };
            if (existsSync('package.json')) {
                Object.assign(pkgjson, require(resolve(process.cwd(), 'package.json')));
            }

            Object.assign(pkgjson.dependencies, pkgjson.devDependencies)

            const unsortedConfigTemplates = readdirSync(resolve(getParentModuleDir(), detectDefaultsConfigPath))
                .map(file => ({
                    file,
                    ...require(resolve(getParentModuleDir(), detectDefaultsConfigPath, file))
                }))
            const configTemplates = sortBySupersedings(unsortedConfigTemplates)
                .filter(configTemplate => configTemplate.condition({ pkgjson }))
                .reverse()
            if (configTemplates) {
                if (configTemplates.length > 1) // we don't care about the default template
                console.log(`[%s] detected defaults from %s`, name, configTemplates.filter(template => template.file !== 'default.config.js').map(template => template.name).join(', '))
                detectedFromDefaults[hash] = Object.assign({}, ...configTemplates.map(template => template.config({ pkgjson })))
            }
        }
        return detectedFromDefaults[hash]
    }
}

module.exports = { configent }

function sortBySupersedings(arr) {
    // clone the array
    arr = [...arr]
    const sorted = []

    while (arr.length) {
        let foundMatch = false
        const supersedings = [].concat(...arr.map(entry => entry.supersedes || []))
        for (const [index, entry] of arr.entries()) {
            const file = entry.file.replace(/\.config\.js/, '')
            if (!supersedings.includes(file)) {
                sorted.push(...arr.splice(index, 1))
                foundMatch = true
                break
            }
        }
        // each iteration should find and pluck one match
        if (!foundMatch) throw Error('Looks like you have circular supersedings \n' + arr.map(f => `${f.file} supersedes ${f.supersedes}`).join('\n'))
    }

    return sorted
}

function createGetParentModuleDir(options) {
    const { module } = options
    let parentModuleDir
    return () => {
        parentModuleDir = parentModuleDir || _getParentModuleDir(module && module.path)
        return parentModuleDir
    }
}

// walk through parents till we find a package.json
function _getParentModuleDir(path) {
    if (!path) {
        const modules = Object.values(require.cache)
            /** @ts-ignore */
            .filter((m) => m.children.includes(module))
        if (modules.length >= 2) missingModuleError(modules)
        else path = modules[0].path
    }

    return (existsSync(resolve(path, 'package.json'))) ?
        path : _getParentModuleDir(dirname(path))
}

function missingModuleError(modules) {
    const paths = modules.map(m => _getParentModuleDir(m.path))
    throw new Error([
        `if multiple packages are using configent, they all need to provide the module.`,
        `Packages using configent: `,
        ...paths.map(p => '- ' + p),
        `Updating the packages may fix the problem.`, ''
    ].join('\n'))
}