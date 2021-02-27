declare module "configent" {
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
    export function configent<options extends {
        [x: string]: any;
    }>(defaults: options, input?: Partial<options>, configentOptions?: {
        name?: string | undefined;
        cacheConfig?: boolean | undefined;
        cacheDetectedDefaults?: boolean | undefined;
        useDotEnv?: boolean | undefined;
        useEnv?: boolean | undefined;
        usePackageConfig?: boolean | undefined;
        useConfig?: boolean | undefined;
        useDetectDefaults?: boolean | undefined;
        detectDefaultsConfigPath?: string | undefined;
        sanitizeEnvValue?: Function | undefined;
        module?: NodeModule;
    }): options;
}
