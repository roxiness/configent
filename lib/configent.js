import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { findPackageJsonDir, getConsumerDir, getPackageJson, sortBySupersedings } from "./util.js"
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { require } from "./getter.cjs";

let instances = {};
/** cached configs - useful if configent are called from multiple places within the same library */
const detectedFromDefaults = {};

const _defaults = {
  name: "",
  cacheConfig: true,
  cacheDetectedDefaults: true,
  useDotEnv: true,
  useEnv: true,
  usePackageConfig: true,
  useConfig: true,
  useDetectDefaults: false,
  detectDefaultsConfigPath: "configs",
  sanitizeEnvValue: (str) => str.replace(/[-_][a-z]/g, (str) => str.substr(1).toUpperCase()),
};

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
export function configent(options) {
  const cfg = new Configent(options, 4);
  return cfg.getConfig();
}

class Configent {
  /**
   *
   * @param {ConfigentOptions} options
   */
  constructor(options, offset = 3) {
    if (options.consumerDir?.startsWith("file://")) options.consumerDir = fileURLToPath(new URL(options.consumerDir));
    options.consumerDir = options.consumerDir ? findPackageJsonDir(options.consumerDir) : getConsumerDir(offset);
    options.name = options.name || getPackageJson(options.consumerDir).name;
    options.clientDir = options.clientDir || process.cwd();

    if(!options.name){
      console.log('[configent] couldn\'t find package.json name', options)
      throw new Error('[configent] Could not create config')
    }
    

    this.options = {
      ..._defaults,
      .../** @type {Config} */ (options),
    };

    // @ts-ignore
    this.upperCaseRE = new RegExp(`^${options.name.toUpperCase()}_`);
  }

  getConfig() {
    const hash = JSON.stringify(this.options);

    if (!instances[hash] || !this.options.cacheConfig) {
      instances[hash] = {
        ...(this.options.useDetectDefaults && this.getDetectDefaults()), //
        ...(this.options.usePackageConfig && this.getPackageConfig()),
        ...(this.options.useConfig && this.getUserConfig()), //
        ...(this.options.useEnv && this.getEnvConfig()),
      };
    }

    return instances[hash];
  }

  getPackageConfig() {
    return getPackageJson(this.options.clientDir)[this.options.name];
  }

  getUserConfig() {
    const regex = new RegExp(`${this.options.name}\.config\..?js`);
    const files = readdirSync(this.options.clientDir);
    const file = files.find((f) => regex.test(f));
    const result = file ? require(resolve(this.options.clientDir, file)) : {};
    return result?.default || result; // support both ES6 and CommonJS exports
  }

  getEnvConfig() {
    this.options.useDotEnv && dotenv.config({ path: resolve(this.options.clientDir, ".env") });

    const parseField = ([key, value]) => {
      key = this.options.sanitizeEnvValue(key.replace(this.upperCaseRE, ""));
      return { key, value };
    };

    const entries = Object.entries(process.env)
      .filter(([key]) => key.match(this.upperCaseRE))
      .map(parseField);

    if (entries.length) return entries.reduce((prev, { key, value }) => ({ ...prev, [key]: value }), {});
  }

  getDetectDefaults() {
    const { name, consumerDir, clientDir } = this.options;
    const hash = JSON.stringify({ name, consumerDir, clientDir });

    // we only want to detect the defaults for any given module once
    if (!detectedFromDefaults[hash] || !this.options.cacheDetectedDefaults) {
      const pkgjson = { dependencies: {}, devDependencies: {} };
      if (existsSync("package.json"))
        Object.assign(pkgjson, JSON.parse(readFileSync(resolve(this.options.clientDir, "package.json"), "utf-8")));

      Object.assign(pkgjson.dependencies, pkgjson.devDependencies);

      const defaultConfigsPath = resolve(
        /** @type{string} */ (this.options.consumerDir),
        this.options.detectDefaultsConfigPath
      );
      const unsortedConfigTemplates = readdirSync(defaultConfigsPath)
        .filter((file) => file.match(/t?m?c?js$/))
        .map((file) => ({
          file,
          ...require(resolve(defaultConfigsPath, file)),
        }));

      const configTemplates = sortBySupersedings(unsortedConfigTemplates)
        .filter((configTemplate) => configTemplate.condition({ pkgjson }))
        .reverse();
      if (configTemplates) {
        console.log(
          `[%s] detected defaults from %s`,
          name,
          configTemplates.map((template) => template.name).join(", ")
        );
        detectedFromDefaults[hash] = Object.assign(
          {},
          ...configTemplates.map((template) => template.config({ pkgjson }))
        );
      }
    }
    return detectedFromDefaults[hash];
  }
}
