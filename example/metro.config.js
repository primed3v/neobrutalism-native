// Metro config for developing the library against this example app.
// The library source (../src) is resolved directly so edits hot-reload.
const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

const projectRoot = __dirname
const libraryRoot = path.resolve(projectRoot, "..")

const config = getDefaultConfig(projectRoot)

config.watchFolders = [libraryRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(libraryRoot, "node_modules"),
]
config.resolver.extraNodeModules = {
  "neobrutalism-native": path.resolve(libraryRoot, "src"),
}
// never pick up the built output while developing
config.resolver.blockList = [new RegExp(`${path.resolve(libraryRoot, "lib").replace(/[\\/]/g, "[\\\\/]")}[\\\\/].*`)]

module.exports = config
