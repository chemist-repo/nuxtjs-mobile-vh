import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { DEFAULT_ID } from './constants'

export interface ModuleOptions {
  id?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'mobile-vh',
    configKey: 'mobileVh',
  },
  defaults: {
    id: DEFAULT_ID,
  },
  setup(_options, _nuxt) {
    _nuxt.options.runtimeConfig.public.mobileVh = {
      ...(_nuxt.options.runtimeConfig.public.mobileVh ?? {}),
      ..._options,
    }

    const resolver = createResolver(import.meta.url)

    addPlugin({
      src: resolver.resolve('./runtime/plugin'),
      mode: 'client',
    })
  },
})
