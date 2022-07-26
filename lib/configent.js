import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { findPackageJsonDir, getConsumerDir, getPackageJson, sortBySupersedings } from "./util.js";
import dotenv from "dotenv";
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
export async function configent(options) {
  const cfg = new Configent(options, 4);
  return cfg.getConfig();
}

class Configent {
  /**
   *
   * @param {ConfigentOptions} options
   */
  constructor(options, offset = 3) {
    options.consumerDir = options.consumerDir ? findPackageJsonDir(options.consumerDir) : getConsumerDir(offset);
    options.name = options.name || getPackageJson(options.consumerDir).name;
    options.clientDir = options.clientDir || process.cwd();

    this.options = {
      ..._defaults,
      .../** @type {Config} */ (options),
    };

    // @ts-ignore
    this.upperCaseRE = new RegExp(`^${options.name.toUpperCase()}_`);
  }

  async getConfig() {
    const hash = JSON.stringify(this.options);

    if (!instances[hash] || !this.options.cacheConfig) {
      instances[hash] = {
        ...(this.options.useDetectDefaults && (await this.getDetectDefaults())),
        ...(this.options.usePackageConfig && this.getPackageConfig()),
        ...(this.options.useConfig && (await this.getUserConfig())),
        ...(this.options.useEnv && this.getEnvConfig()),
      };
    }

    return instances[hash];
  }

  getPackageConfig() {
    return getPackageJson(this.options.clientDir)[this.options.name];
  }

  getUserConfig() {
    const path = resolve(this.options.clientDir, `${this.options.name}.config.js`);
    return existsSync(path) ? import("file:///" + path).then((r) => r.default) : {};
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

  async getDetectDefaults() {
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
      const unsortedConfigTemplates = await Promise.all(
        readdirSync(defaultConfigsPath)
          .filter((file) => file.match(/t?m?c?js$/))
          .map(async (file) => ({
            file,
            ...(await import("file:///" + resolve(defaultConfigsPath, file)).then((r) => r.default)),
          }))
      );

      const configTemplates = sortBySupersedings(unsortedConfigTemplates)
        .filter((configTemplate) => configTemplate.condition({ pkgjson }))
        .reverse();
      if (configTemplates) {
        if (configTemplates.length > 1)
          // we don't care about the default template
          console.log(
            `[%s] detected defaults from %s`,
            name,
            configTemplates
              .filter((template) => template.file !== "default.config.js")
              .map((template) => template.name)
              .join(", ")
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
