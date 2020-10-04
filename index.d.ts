declare module "index" {
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
    export function configent<options extends {
        [x: string]: any;
    }>(name: string, defaults: options, input?: Partial<options>, configentOptions?: {
        singleton: boolean;
        useDotEnv: boolean;
        useEnv: boolean;
        usePackageConfig: boolean;
        useConfig: boolean;
        sanitizeEnvValue: Function;
    }): options;
}
