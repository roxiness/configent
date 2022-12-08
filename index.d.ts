declare module "util" {
    export function sortBySupersedings(arr: any): any[];
    export function findPackageJsonDir(path: string): string;
    export function getConsumerDir(offset: number): string;
    export function getPackageJson(path: string): any;
}
declare module "configent" {
    /**
     * @typedef {Object} ConfigentOptions
     * @prop {string=} name name to use for configs. If left empty, name from package.json is used
     * @prop {boolean=} [cacheConfig = true] calling configent twice with same parameters will return the same instance
     * @prop {boolean=} [cacheDetectedDefaults = true] calling configent twice from the same module will return the same defaults
     * @prop {boolean=} [useDotEnv = true] include config from .env files
     * @prop {boolean=} [useEnv = true] include config from process.env
     * @prop {boolean=} [usePackageConfig = true] include config from package.json
     * @prop {boolean=} [useConfig = true] include config from [name].config.js
     * @prop {boolean=} [useDetectDefaults = true] detect defaults from context (package.json and file stucture)
     * @prop {string=} [detectDefaultsConfigPath = 'configs'] detect defaults from context (package.json and file stucture)
     * @prop {function=} [sanitizeEnvValue = str => str.replace(/[-_][a-z]/g, str => str.substr(1).toUpperCase())] sanitize environment values. Convert snake_case to camelCase by default.
     * @prop {string=} consumerDir root folder of consuming project, use __dirname or import.meta.url
     * @prop {string=} clientDir folder where the project is used, usually process.cwd()
     */
    /**
     * @typedef {ConfigentOptions & {clientDir: string, consumerDir: string}} Config
     */
    /**
     * @param {ConfigentOptions} options
     */
    export function configent(options: ConfigentOptions): any;
    export type ConfigentOptions = {
        /**
         * name to use for configs. If left empty, name from package.json is used
         */
        name?: string | undefined;
        /**
         * calling configent twice with same parameters will return the same instance
         */
        cacheConfig?: boolean | undefined;
        /**
         * calling configent twice from the same module will return the same defaults
         */
        cacheDetectedDefaults?: boolean | undefined;
        /**
         * include config from .env files
         */
        useDotEnv?: boolean | undefined;
        /**
         * include config from process.env
         */
        useEnv?: boolean | undefined;
        /**
         * include config from package.json
         */
        usePackageConfig?: boolean | undefined;
        /**
         * include config from [name].config.js
         */
        useConfig?: boolean | undefined;
        /**
         * detect defaults from context (package.json and file stucture)
         */
        useDetectDefaults?: boolean | undefined;
        /**
         * detect defaults from context (package.json and file stucture)
         */
        detectDefaultsConfigPath?: string | undefined;
        /**
         * sanitize environment values. Convert snake_case to camelCase by default.
         */
        sanitizeEnvValue?: Function | undefined;
        /**
         * root folder of consuming project, use __dirname or import.meta.url
         */
        consumerDir?: string | undefined;
        /**
         * folder where the project is used, usually process.cwd()
         */
        clientDir?: string | undefined;
    };
    export type Config = ConfigentOptions & {
        clientDir: string;
        consumerDir: string;
    };
}
