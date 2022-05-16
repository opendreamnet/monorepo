import { defineNuxtPlugin } from '#app'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'

<%
const imports = []
const icons = []

function addIcons(payload, version) {
  for (const style in payload) {
    const items = payload[style]

    for (const icon of items) {
      imports.push(`import { ${icon} } from '@fortawesome/${version}-${style}-svg-icons/${icon}'`)
      icons.push(icon)
    }
  }
}

// Add icons
addIcons(options.icons, 'free')
addIcons(options.proIcons, 'pro')
%>

// Print imports
<%= imports.join('\n\n') %>

export default defineNuxtPlugin((app) => {
  // Add to FontAwesome library
  library.add(
    <%= icons.join(',\n  ') %>
  )

  // Add component
  app.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})

