export type ColdServerAction = (...options: unknown[]) => Promise<unknown>

function createColdServerAction(name: string): ColdServerAction {
  return async () => {
    throw new Error(
      `@devup-api/fetch/server.${name} is a cold-typing placeholder. Configure a devup-api bundler plugin so this import is replaced by generated Server Actions.`,
    )
  }
}

export const actions: Record<string, ColdServerAction> = new Proxy(
  {},
  {
    get: (_target, property) => createColdServerAction(String(property)),
  },
)
