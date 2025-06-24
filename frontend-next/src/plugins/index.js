/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import store from '@/plugins/store/store.js'

export function registerPlugins (app) {
  app.use(vuetify)
  app.use(store)
}
