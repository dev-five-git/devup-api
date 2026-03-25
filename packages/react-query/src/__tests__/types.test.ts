/**
 * Type tests for DevupQueryClient
 * Verify that useQueries type inference works correctly per element
 */
import { describe, expectTypeOf, test } from 'bun:test'
import type { DevupGetApiStruct } from '@devup-api/core'
import type { DevupQueryClient } from '../query-client'

// =============================================================================
// Test Fixtures
// =============================================================================

declare module '@devup-api/core' {
  interface DevupApiServers {
    'react-query-test.json': never
  }

  interface DevupGetApiStruct {
    'react-query-test.json': {
      '/users': {
        response: { id: number; name: string }[]
        error: { message: string }
      }
      '/users/{id}': {
        params: { id: string }
        response: { id: number; name: string; email: string }
        error: { message: string; code: number }
      }
      '/posts': {
        response: { id: number; title: string }[]
        error: { message: string }
      }
    }
  }

  interface DevupPostApiStruct {
    'react-query-test.json': {
      '/users': {
        body: { name: string; email: string }
        response: { id: number }
        error: { message: string }
      }
    }
  }

  interface DevupDeleteApiStruct {
    'react-query-test.json': {
      '/users/{id}': {
        params: { id: string }
        response: { success: boolean }
        error: { message: string }
      }
    }
  }
}

type QC = DevupQueryClient<'react-query-test.json'>

// =============================================================================
// useQueries - Per-element return type inference
// =============================================================================

describe('useQueries per-element type inference', () => {
  test('different endpoints return different response types', () => {
    type Result = ReturnType<
      (
        qc: QC,
      ) => ReturnType<
        typeof qc.useQueries<[['get', '/users'], ['get', '/posts']]>
      >
    >

    expectTypeOf<Result[0]['data']>().toEqualTypeOf<
      { id: number; name: string }[] | undefined
    >()
    expectTypeOf<Result[1]['data']>().toEqualTypeOf<
      { id: number; title: string }[] | undefined
    >()
  })

  test('different endpoints return different error types', () => {
    type Result = ReturnType<
      (
        qc: QC,
      ) => ReturnType<
        typeof qc.useQueries<
          [
            ['get', '/users/{id}', { params: { id: string } }],
            ['get', '/users'],
          ]
        >
      >
    >

    expectTypeOf<Result[0]['data']>().toEqualTypeOf<
      { id: number; name: string; email: string } | undefined
    >()
    expectTypeOf<Result[0]['error']>().toEqualTypeOf<{
      message: string
      code: number
    } | null>()
    expectTypeOf<Result[1]['data']>().toEqualTypeOf<
      { id: number; name: string }[] | undefined
    >()
    expectTypeOf<Result[1]['error']>().toEqualTypeOf<{
      message: string
    } | null>()
  })

  test('single element preserves exact type', () => {
    type Result = ReturnType<
      (qc: QC) => ReturnType<typeof qc.useQueries<[['get', '/posts']]>>
    >

    expectTypeOf<Result[0]['data']>().toEqualTypeOf<
      { id: number; title: string }[] | undefined
    >()
  })

  test('result types are not intersected', () => {
    type Result = ReturnType<
      (
        qc: QC,
      ) => ReturnType<
        typeof qc.useQueries<[['get', '/users'], ['get', '/posts']]>
      >
    >

    // result[0] should NOT have title (from /posts)
    type Data0 = NonNullable<Result[0]['data']>[number]
    expectTypeOf<
      'title' extends keyof Data0 ? true : false
    >().toEqualTypeOf<false>()

    // result[1] should NOT have name (from /users)
    type Data1 = NonNullable<Result[1]['data']>[number]
    expectTypeOf<
      'name' extends keyof Data1 ? true : false
    >().toEqualTypeOf<false>()
  })
})

// =============================================================================
// useQueries - params constraint
// =============================================================================

describe('useQueries params constraint', () => {
  test('endpoint with params accepts params option', () => {
    // This should be valid: correct params provided
    type _Valid = ReturnType<
      (
        qc: QC,
      ) => ReturnType<
        typeof qc.useQueries<
          [['get', '/users/{id}', { params: { id: string } }]]
        >
      >
    >
  })

  test('endpoint without params has optional options', () => {
    // This should be valid: no options needed
    type _Valid = ReturnType<
      (qc: QC) => ReturnType<typeof qc.useQueries<[['get', '/users']]>>
    >
  })
})

// =============================================================================
// useQuery - single query type inference (baseline)
// =============================================================================

describe('useQuery type inference baseline', () => {
  test('response type inferred from endpoint', () => {
    type Result = ReturnType<
      (
        qc: QC,
      ) => ReturnType<
        typeof qc.useQuery<
          'get',
          DevupGetApiStruct['react-query-test.json'],
          '/users'
        >
      >
    >

    expectTypeOf<Result['data']>().toEqualTypeOf<
      { id: number; name: string }[] | undefined
    >()
  })

  test('error type inferred from endpoint', () => {
    type Result = ReturnType<
      (
        qc: QC,
      ) => ReturnType<
        typeof qc.useQuery<
          'get',
          DevupGetApiStruct['react-query-test.json'],
          '/users/{id}'
        >
      >
    >

    expectTypeOf<Result['data']>().toEqualTypeOf<
      { id: number; name: string; email: string } | undefined
    >()
    expectTypeOf<Result['error']>().toEqualTypeOf<{
      message: string
      code: number
    } | null>()
  })
})
