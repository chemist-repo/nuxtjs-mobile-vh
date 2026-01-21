import { defineNuxtPlugin } from '#app'
import { ref } from 'vue'

import './vh.css'

const debounce = <This, T extends (this: This, ...args: any[]) => any>(
  func: T,
  delay: number
): (this: This, ...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout | null = null;

  return function(this: This, ...args: Parameters<T>): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.call(this, ...args);
      timeoutId = null;
    }, delay);
  };
}

export default defineNuxtPlugin({
  name: 'mobile-vh-plugin',
  hooks: {
    'app:mounted'(app) {
      const nuxtAppEl = app._container as HTMLElement & { _id: string }
      nuxtAppEl._id = app.$nuxt.$config.public.mobileVh.id
      nuxtAppEl.classList.add('__vh')
    }
  },
  setup(_nuxtApp) {
    const vh = ref(0)
  
    const setVh = () => {
      vh.value = window.innerHeight * 0.01
  
      document.documentElement.style.setProperty('--vh', `${vh.value}px`)
    }
  
    const debouncedResize = debounce(() => {
      setVh()
    }, 100)
  
    void (() => {
      setVh()
  
      window.addEventListener('resize', debouncedResize)
    })()
  
    _nuxtApp.vueApp.provide('vh', vh)
    _nuxtApp.vueApp.onUnmount(() => {
      window.removeEventListener('resize', debouncedResize)
    })
  
    return {
      provide: {
        vh,
      }
    }
  }
})
