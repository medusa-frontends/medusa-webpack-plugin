import finder from 'find-package-json'
import fs from 'fs'
import path from 'path'
import { Compiler, container } from 'webpack'

type ModuleFederationPluginOptions = ConstructorParameters<
  typeof container.ModuleFederationPlugin
>[0]

const PLUGIN_NAME = 'MedusaPlugin'

const message = (text: string) => `[${PLUGIN_NAME}] ${text}`
const log = (text: string) => console.log(text)

export const MESSAGES = {
  BEFORE_COMPILE: () => message('Service Event - Before Compile'),
  AFTER_COMPILE: () => message('Service Event - After Compile'),
}

function readOptions(): ModuleFederationPluginOptions {
  const packageJsonPath = finder(process.cwd()).next().filename
  if (!packageJsonPath) throw new Error('No package.json found')
  const appPath = packageJsonPath.slice(0, -'/package.json'.length)
  const tempFolderPath = path.join(appPath, './.medusa')
  const pluginOptionsPath = path.join(tempFolderPath, './plugin-options.json')
  const buffer = fs.readFileSync(pluginOptionsPath)
  return JSON.parse(buffer.toString())
}

export class MedusaPlugin extends container.ModuleFederationPlugin {
  constructor() {
    const options = readOptions()
    super(options)
  }

  apply(compiler: Compiler) {
    super.apply(compiler)

    compiler.hooks.beforeCompile.tap(PLUGIN_NAME, () =>
      log(MESSAGES.BEFORE_COMPILE())
    )

    compiler.hooks.afterCompile.tap(PLUGIN_NAME, () =>
      log(MESSAGES.AFTER_COMPILE())
    )
  }
}
