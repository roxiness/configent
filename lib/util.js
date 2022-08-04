import { existsSync, readFileSync } from "fs";
import { dirname } from "path";

/**
 * travels parent dirs till it finds a dir containing a package.json
 * @param {string} path
 * @returns {string}
 */
export const findPackageJsonDir = (path) =>
  existsSync(`${path}/package.json`) ? path : path === "." ? "" : findPackageJsonDir(dirname(path));

/**
 * returns the dir of the project using configent. Not to be confused with process.cwd
 * @param {number} offset
 * @returns {string}
 */
export const getConsumerDir = (offset) => {
  const fakeErr = new Error();
  if (!fakeErr.stack)
    throw new Error("[configent] Stack trace is disabled. Please enable stack traces or use options.name.");
  const path = fakeErr.stack.split("\n")[offset].match(/file:\/\/\/(.+)/)?.[1] || '';
  //   console.log("fs", dirname(path));
  return findPackageJsonDir(path);
};

/**
 * returns the nearest package.json
 * @param {string} path
 */
export const getPackageJson = (path) => {
  const pkgPath = `${path}/package.json`;
  if (existsSync(pkgPath)) return JSON.parse(readFileSync(pkgPath, "utf-8"));
  return getPackageJson(dirname(path));
};

export function sortBySupersedings(arr) {
  // clone the array
  arr = [...arr];
  const sorted = [];

  while (arr.length) {
    let foundMatch = false;
    const supersedings = [].concat(...arr.map((entry) => entry.supersedes || []));
    for (const [index, entry] of arr.entries()) {
      const file = entry.file.replace(/\.config\.js/, "");
      if (!supersedings.includes(file)) {
        sorted.push(...arr.splice(index, 1));
        foundMatch = true;
        break;
      }
    }
    // each iteration should find and pluck one match
    if (!foundMatch)
      throw Error(
        "Looks like you have circular supersedings \n" +
          arr.map((f) => `${f.file} supersedes ${f.supersedes}`).join("\n")
      );
  }

  return sorted;
}
