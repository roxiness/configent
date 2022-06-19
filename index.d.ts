declare module "configent" {
    /**
     * @param {object} [options] configent options
     * @param {{}=} [options.defaults = {}] defaults. Used for type casting env variables
     * @param {string=} [options.name = ''] name to use for configs. If left empty, name from package.json is used
     * @param {boolean=} [options.cacheConfig = true] calling configent twice with same parameters will return the same instance
     * @param {boolean=} [options.cacheDetectedDefaults = true] calling configent twice from the same module will return the same defaults
     * @param {boolean=} [options.useDotEnv = true] include config from .env files
     * @param {boolean=} [options.useEnv = true] include config from process.env
     * @param {boolean=} [options.usePackageConfig = true] include config from package.json
     * @param {boolean=} [options.useConfig = true] include config from [name].config.js
     * @param {boolean=} [options.useDetectDefaults = true] detect defaults from context (package.json and file stucture)
     * @param {string=} [options.detectDefaultsConfigPath = 'configs'] detect defaults from context (package.json and file stucture)
     * @param {function=} [options.sanitizeEnvValue = str => str.replace(/[-_][a-z]/g, str => str.substr(1).toUpperCase())] sanitize environment values. Convert snake_case to camelCase by default.
     * @param {NodeModule} [options.module] required if multiple modules are using configent
     */
    export function configent(options?: {
        defaults?: {} | undefined;
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
    }): any;
}
