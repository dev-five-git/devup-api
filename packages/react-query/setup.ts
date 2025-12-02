import { beforeAll } from 'bun:test'

// Setup DOM environment for React testing
if (typeof globalThis.document === 'undefined') {
  // @ts-expect-error - happy-dom types
  const { Window } = await import('happy-dom')
  const window = new Window()
  const document = window.document

  // @ts-expect-error - setting global document
  globalThis.window = window
  // @ts-expect-error - setting global document
  globalThis.document = document
  // @ts-expect-error - setting global navigator
  globalThis.navigator = window.navigator
  // @ts-expect-error - setting global HTMLElement
  globalThis.HTMLElement = window.HTMLElement
}

beforeAll(() => {
  // Ensure DOM is ready
  if (globalThis.document) {
    const root = globalThis.document.createElement('div')
    root.id = 'root'
    globalThis.document.body.appendChild(root)
  }
})
