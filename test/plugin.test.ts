import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock defineNuxtPlugin
vi.mock('#app', () => ({
  defineNuxtPlugin: (plugin: any) => plugin,
}))

// Mock window and document
const mockWindow = {
  innerHeight: 800,
  addEventListener: vi.fn() as ReturnType<typeof vi.fn>,
  removeEventListener: vi.fn() as ReturnType<typeof vi.fn>,
}

const mockDocument = {
  documentElement: {
    style: {
      setProperty: vi.fn() as ReturnType<typeof vi.fn>,
    },
  },
  createElement: vi.fn((tag: string) => ({
    tagName: tag,
    classList: {
      add: vi.fn(),
    },
  })),
}

// Mock global objects
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
  configurable: true,
})

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
  configurable: true,
})

// Import plugin after mocks
const pluginModule = await import('../src/runtime/plugin')
const plugin = pluginModule.default

describe('mobile-vh plugin', () => {
  let nuxtApp: any
  let mockContainer: any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Create mock container
    mockContainer = {
      classList: {
        add: vi.fn(),
      },
    }

    // Create mock NuxtApp
    nuxtApp = {
      _container: mockContainer,
      $nuxt: {
        $config: {
          public: {
            mobileVh: {
              id: 'test-id',
            },
          },
        },
      },
      vueApp: {
        provide: vi.fn() as ReturnType<typeof vi.fn>,
        onUnmount: vi.fn() as ReturnType<typeof vi.fn>,
      },
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('setup', () => {
    it('should return vh ref', () => {
      if (!plugin.setup) {
        throw new Error('plugin.setup is undefined')
      }
      const result = plugin.setup(nuxtApp)

      expect(result).toBeDefined()
      if (result && 'provide' in result) {
        expect(result.provide).toBeDefined()
        expect(result.provide?.vh).toBeDefined()
        expect(result.provide?.vh.value).toBe(8) // 800 * 0.01
      }
    })

    it('should set CSS variable --vh on document.documentElement', () => {
      if (!plugin.setup) {
        throw new Error('plugin.setup is undefined')
      }
      plugin.setup(nuxtApp)

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--vh',
        '8px'
      )
    })

    it('should call setVh on initialization', () => {
      if (!plugin.setup) {
        throw new Error('plugin.setup is undefined')
      }
      mockWindow.innerHeight = 1000
      plugin.setup(nuxtApp)

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--vh',
        '10px' // 1000 * 0.01
      )
    })

    it('should provide vh through vueApp.provide', () => {
      if (!plugin.setup) {
        throw new Error('plugin.setup is undefined')
      }
      plugin.setup(nuxtApp)

      expect(nuxtApp.vueApp?.provide).toHaveBeenCalledWith('vh', expect.any(Object))
    })

    it('should register resize event handler', () => {
      if (!plugin.setup) {
        throw new Error('plugin.setup is undefined')
      }
      plugin.setup(nuxtApp)

      expect(mockWindow.addEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      )
    })

    it('should register cleanup function on unmount', () => {
      if (!plugin.setup) {
        throw new Error('plugin.setup is undefined')
      }
      plugin.setup(nuxtApp)

      expect(nuxtApp.vueApp?.onUnmount).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should remove resize handler on unmount', () => {
      if (!plugin.setup) {
        throw new Error('plugin.setup is undefined')
      }
      plugin.setup(nuxtApp)

      const onUnmountMock = nuxtApp.vueApp.onUnmount as ReturnType<typeof vi.fn>
      const addEventListenerMock = mockWindow.addEventListener as ReturnType<typeof vi.fn>
      
      if (!onUnmountMock.mock.calls[0] || !addEventListenerMock.mock.calls[0]) {
        throw new Error('Mock calls are undefined')
      }

      const onUnmountCallback = onUnmountMock.mock.calls[0][0]
      const resizeHandler = addEventListenerMock.mock.calls[0][1]

      onUnmountCallback()

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('resize', resizeHandler)
    })
  })

  describe('app:mounted hook', () => {
    it('should add __vh class to nuxtAppEl', () => {
      plugin.hooks?.['app:mounted']?.(nuxtApp)

      expect(mockContainer.classList.add).toHaveBeenCalledWith('__vh')
    })
  })

  describe('debounce', () => {
    it('should call setVh no more than once per 100ms on resize', () => {
      if (!plugin.setup) {
        throw new Error('plugin.setup is undefined')
      }
      mockWindow.innerHeight = 800
      plugin.setup(nuxtApp)

      const addEventListenerMock = mockWindow.addEventListener as ReturnType<typeof vi.fn>
      if (!addEventListenerMock.mock.calls[0]) {
        throw new Error('addEventListener mock calls are undefined')
      }
      const resizeHandler = addEventListenerMock.mock.calls[0][1]

      // First call
      mockWindow.innerHeight = 900
      resizeHandler()
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledTimes(1) // Initialization

      // Second call immediately - should not trigger
      mockWindow.innerHeight = 1000
      resizeHandler()
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledTimes(1)

      // After 50ms - should still not trigger
      vi.advanceTimersByTime(50)
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledTimes(1)

      // After 100ms - should trigger
      vi.advanceTimersByTime(50)
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledTimes(2)
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenLastCalledWith(
        '--vh',
        '10px' // 1000 * 0.01
      )
    })

    it('should cancel previous call on new resize', () => {
      if (!plugin.setup) {
        throw new Error('plugin.setup is undefined')
      }
      mockWindow.innerHeight = 800
      plugin.setup(nuxtApp)

      const addEventListenerMock = mockWindow.addEventListener as ReturnType<typeof vi.fn>
      if (!addEventListenerMock.mock.calls[0]) {
        throw new Error('addEventListener mock calls are undefined')
      }
      const resizeHandler = addEventListenerMock.mock.calls[0][1]

      // First call
      mockWindow.innerHeight = 900
      resizeHandler()
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledTimes(1) // Initialization

      // Second call after 50ms
      vi.advanceTimersByTime(50)
      mockWindow.innerHeight = 1000
      resizeHandler()

      // Third call after another 50ms (100ms total from first)
      vi.advanceTimersByTime(50)
      mockWindow.innerHeight = 1100
      resizeHandler()

      // First call should not trigger as it was cancelled
      vi.advanceTimersByTime(50)
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledTimes(1)

      // Only the last call should trigger
      vi.advanceTimersByTime(50)
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledTimes(2)
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenLastCalledWith(
        '--vh',
        '11px' // 1100 * 0.01
      )
    })

    it('should update --vh on window resize', () => {
      if (!plugin.setup) {
        throw new Error('plugin.setup is undefined')
      }
      mockWindow.innerHeight = 800
      plugin.setup(nuxtApp)

      const addEventListenerMock = mockWindow.addEventListener as ReturnType<typeof vi.fn>
      if (!addEventListenerMock.mock.calls[0]) {
        throw new Error('addEventListener mock calls are undefined')
      }
      const resizeHandler = addEventListenerMock.mock.calls[0][1]

      // Change window size
      mockWindow.innerHeight = 1200
      resizeHandler()

      // Wait for debounce
      vi.advanceTimersByTime(100)

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenLastCalledWith(
        '--vh',
        '12px' // 1200 * 0.01
      )
    })
  })
})
