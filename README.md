# nuxtjs-mobile-vh

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A Nuxt module that fixes the viewport height issue on mobile devices by providing a dynamic CSS variable `--vh` that accurately represents 1% of the viewport height.

## The Problem

On mobile browsers (especially iOS Safari), the `100vh` unit doesn't account for the browser's address bar, which appears and disappears when scrolling. This causes layout issues where content might be cut off or have unwanted scrollbars.

## The Solution

This module calculates the actual viewport height and sets a CSS variable `--vh` equal to 1% of the real window height. This variable updates dynamically when the window is resized (with debouncing for performance).

## Features

- 📱 &nbsp;Fixes viewport height issues on mobile devices
- ⚡ &nbsp;Debounced resize handling for optimal performance
- 🎨 &nbsp;Automatic CSS variable injection (`--vh`)
- 🔄 &nbsp;Reactive Vue composable for programmatic access
- 🎯 &nbsp;Zero configuration required

## Quick Setup

Install the module to your Nuxt application:

```bash
npx nuxt module add nuxtjs-mobile-vh
```

That's it! The module will automatically:
- Add the `__vh` class to your app container
- Set the `--vh` CSS variable on `document.documentElement`
- Provide a reactive `vh` ref through Vue's provide/inject system

## Usage

### CSS

The module automatically adds the `__vh` class to your Nuxt app container and sets up the CSS variable. You can use it in your styles:

```css
.my-component {
  height: calc(var(--vh, 1vh) * 100);
  min-height: calc(var(--vh, 1vh) * 100);
}
```

The module also includes a default style for the `__vh` class:

```css
.__vh {
  display: flex;
  min-height: 100vh;
  min-height: calc(var(--vh, 1vh) * 100);
}
```

### Vue Composable

You can also access the `vh` value programmatically in your components:

```vue
<script setup>
const { $vh } = useNuxtApp()
// or
const vh = inject('vh')
</script>
```

## Configuration

You can configure the module in your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxtjs-mobile-vh'],
})
```

## How It Works

1. On app mount, the module calculates `window.innerHeight * 0.01` and sets it as the `--vh` CSS variable
2. A debounced resize listener (100ms delay) updates the `--vh` variable when the window is resized
3. The `__vh` class is automatically added to your Nuxt app container
4. A reactive `vh` ref is provided through Vue's provide/inject system for programmatic access

## Browser Support

Works in all modern browsers that support CSS custom properties (CSS variables). The module is client-side only and won't affect SSR.

## License

MIT

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxtjs-mobile-vh/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxtjs-mobile-vh

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxtjs-mobile-vh.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxtjs-mobile-vh

[license-src]: https://img.shields.io/npm/l/nuxtjs-mobile-vh.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxtjs-mobile-vh

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
