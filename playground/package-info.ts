// Named imports so Vite tree-shakes the rest of package.json out of the bundle.
import { homepage, name, repository, version } from '../package.json'

// Single source for the package name and links shown across the docs site.
export const PKG = name
export const VERSION = version
export const HOMEPAGE = homepage
export const GITHUB_URL = repository.url.replace(/\.git$/, '')
export const NPM_URL = `https://www.npmjs.com/package/${name}`
