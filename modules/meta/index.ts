// Mirrors what nuxt-component-meta does:
// - alias `#meta` → a generated *file* in the buildDir
// - Nitro virtual `#meta/nitro` (nested under that alias)
// - a server handler importing the virtual
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { addServerHandler, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'meta' },
  setup(_, nuxt) {
    const resolver = createResolver(import.meta.url)

    // written to disk → exists from the 2nd run on
    addTemplate({ filename: 'meta.mjs', getContents: () => 'export default { hello: "world" }', write: true })
    nuxt.options.alias['#meta'] = join(nuxt.options.buildDir, 'meta.mjs')

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.virtual ||= {}
      nitroConfig.virtual['#meta/nitro'] = () => readFileSync(join(nuxt.options.buildDir, 'meta.mjs'), 'utf-8')
    })

    addServerHandler({ route: '/api/meta', handler: resolver.resolve('./runtime/handler') })
  },
})
