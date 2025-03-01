import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'

import Slider from 'primevue/slider'

import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css' // For PrimeVue icons
import 'primeflex/primeflex.css' // Optional utility classes

const app = createApp(App)

// Use PrimeVue first before registering components
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
  ripple: true,
  unstyled: false,
  dark: false,
})

app.component('Slider', Slider)
app.mount('#app')
