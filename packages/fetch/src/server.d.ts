export type ColdServerAction = (...options: unknown[]) => Promise<unknown>

export declare const actions: Record<string, ColdServerAction>

declare module '@devup-api/fetch/server-generated' {}

export * from '@devup-api/fetch/server-generated'
