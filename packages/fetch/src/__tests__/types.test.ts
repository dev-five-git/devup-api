/**
 * Type tests for fetch API client
 * Verify that API client type inference works correctly
 */
import { describe, expectTypeOf, test } from 'bun:test'
import type {
  DevupDeleteApiStruct,
  DevupGetApiStruct,
  DevupObject,
  DevupPostApiStruct,
  DevupPutApiStruct,
} from '@devup-api/core'
import type { DevupApiResponse } from '../api'
import { createApi } from '../create-api'

// =============================================================================
// Test Fixtures
// =============================================================================

declare module '@devup-api/core' {
  interface DevupApiServers {
    'openapi.json': never
    'admin-api.json': never
  }

  interface DevupGetApiStruct {
    'openapi.json': {
      '/users': {
        response: { id: number; name: string }[]
        error: { message: string }
      }
      '/users/{id}': {
        params: { id: string }
        query?: { include?: string }
        response: { id: number; name: string; email: string }
        error: { message: string; code: number }
      }
    }
    'admin-api.json': {
      '/admin/users': {
        response: { id: number; role: string }[]
        error: { message: string }
      }
    }
  }

  interface DevupPostApiStruct {
    'openapi.json': {
      '/users': {
        body: { name: string; email: string }
        response: { id: number; name: string }
        error: { message: string; errors?: { field: string; msg: string }[] }
      }
    }
  }

  interface DevupPutApiStruct {
    'openapi.json': {
      '/users/{id}': {
        params: { id: string }
        body: { name: string; email: string }
        response: { id: number }
        error: { message: string }
      }
    }
  }

  interface DevupDeleteApiStruct {
    'openapi.json': {
      '/users/{id}': {
        params: { id: string }
        response: { success: boolean }
        error: { message: string }
      }
    }
  }

  interface DevupResponseComponentStruct {
    'openapi.json': {
      User: { id: number; name: string; email: string }
    }
  }

  interface DevupRequestComponentStruct {
    'openapi.json': {
      CreateUserRequest: { name: string; email: string }
    }
  }

  interface DevupErrorComponentStruct {
    'openapi.json': {
      ApiError: { message: string; code: number }
    }
  }
}

// =============================================================================
// DevupApiResponse - Response type verification
// =============================================================================

describe('DevupApiResponse', () => {
  test('success response type - data exists, error undefined', () => {
    type Response = DevupApiResponse<{ id: number }, { message: string }>
    type SuccessCase = Extract<Response, { data: { id: number } }>

    expectTypeOf<SuccessCase['data']>().toEqualTypeOf<{ id: number }>()
    expectTypeOf<SuccessCase['error']>().toEqualTypeOf<undefined>()
  })

  test('error response type - error exists, data undefined', () => {
    type Response = DevupApiResponse<{ id: number }, { message: string }>
    type ErrorCase = Extract<Response, { error: { message: string } }>

    expectTypeOf<ErrorCase['error']>().toEqualTypeOf<{ message: string }>()
    expectTypeOf<ErrorCase['data']>().toEqualTypeOf<undefined>()
  })

  test('response type from actual endpoint', () => {
    type Endpoint = DevupGetApiStruct['openapi.json']['/users/{id}']
    type Response = DevupApiResponse<Endpoint['response'], Endpoint['error']>

    type SuccessData = Extract<Response, { data: Endpoint['response'] }>['data']
    type ErrorData = Extract<Response, { error: Endpoint['error'] }>['error']

    expectTypeOf<SuccessData>().toEqualTypeOf<{
      id: number
      name: string
      email: string
    }>()
    expectTypeOf<ErrorData>().toEqualTypeOf<{ message: string; code: number }>()
  })
})

// =============================================================================
// createApi - API instance creation verification
// =============================================================================

describe('createApi', () => {
  test('creates with default server', () => {
    const api = createApi('https://api.example.com')

    // default server is 'openapi.json'
    expectTypeOf(api.get).toBeFunction()
    expectTypeOf(api.post).toBeFunction()
    expectTypeOf(api.put).toBeFunction()
    expectTypeOf(api.delete).toBeFunction()
    expectTypeOf(api.patch).toBeFunction()
  })

  test('creates with different server', () => {
    const adminApi = createApi({
      baseUrl: 'https://admin.example.com',
      serverName: 'admin-api.json',
    })

    // can use admin-api.json server endpoints
    expectTypeOf(adminApi.get).toBeFunction()
  })

  test('instance method types', () => {
    const api = createApi('https://api.example.com')

    expectTypeOf(api.getBaseUrl()).toEqualTypeOf<string>()
    expectTypeOf(api.use).toBeFunction()
    expectTypeOf(api.setDefaultOptions).toBeFunction()
  })
})

// =============================================================================
// GET method type verification
// =============================================================================

describe('DevupApi.get type inference', () => {
  const api = createApi('https://api.example.com')

  test('endpoint without params - options optional', () => {
    // /users has no params so options are optional
    type GetUsers = typeof api.get<
      '/users',
      DevupGetApiStruct['openapi.json']['/users']
    >
    type Params = Parameters<GetUsers>

    // first parameter is path, second is options (optional)
    expectTypeOf<Params[0]>().toEqualTypeOf<'/users'>()
  })

  test('endpoint with params - options required', () => {
    // /users/{id} has params so options are required
    type Endpoint = DevupGetApiStruct['openapi.json']['/users/{id}']

    // params must be { id: string }
    expectTypeOf<Endpoint['params']>().toEqualTypeOf<{ id: string }>()
  })

  test('GET/get case aliases are identical', () => {
    expectTypeOf(api.get).toEqualTypeOf(api.GET)
  })
})

// =============================================================================
// POST method type verification
// =============================================================================

describe('DevupApi.post type inference', () => {
  test('endpoint with required body', () => {
    type Endpoint = DevupPostApiStruct['openapi.json']['/users']

    // body is required
    expectTypeOf<Endpoint['body']>().toEqualTypeOf<{
      name: string
      email: string
    }>()

    // response type should also be correct
    expectTypeOf<Endpoint['response']>().toEqualTypeOf<{
      id: number
      name: string
    }>()
  })

  test('error type can include additional fields', () => {
    type Endpoint = DevupPostApiStruct['openapi.json']['/users']
    type Error = Endpoint['error']

    // error can optionally include errors array
    expectTypeOf<Error>().toEqualTypeOf<{
      message: string
      errors?: { field: string; msg: string }[]
    }>()
  })
})

// =============================================================================
// PUT/DELETE method type verification
// =============================================================================

describe('DevupApi.put/delete type inference', () => {
  test('PUT - both params and body required', () => {
    type Endpoint = DevupPutApiStruct['openapi.json']['/users/{id}']

    expectTypeOf<Endpoint['params']>().toEqualTypeOf<{ id: string }>()
    expectTypeOf<Endpoint['body']>().toEqualTypeOf<{
      name: string
      email: string
    }>()
  })

  test('DELETE - params required, no body', () => {
    type Endpoint = DevupDeleteApiStruct['openapi.json']['/users/{id}']

    expectTypeOf<Endpoint['params']>().toEqualTypeOf<{ id: string }>()
    expectTypeOf<Endpoint['response']>().toEqualTypeOf<{ success: boolean }>()

    // body should not exist
    type HasBody = 'body' extends keyof Endpoint ? true : false
    expectTypeOf<HasBody>().toEqualTypeOf<false>()
  })
})

// =============================================================================
// DevupObject integration verification
// =============================================================================

describe('DevupObject type access', () => {
  test('uses response component type', () => {
    type User = DevupObject<'response', 'openapi.json'>['User']

    expectTypeOf<User>().toEqualTypeOf<{
      id: number
      name: string
      email: string
    }>()
  })

  test('uses request component type', () => {
    type CreateUserRequest = DevupObject<
      'request',
      'openapi.json'
    >['CreateUserRequest']

    expectTypeOf<CreateUserRequest>().toEqualTypeOf<{
      name: string
      email: string
    }>()
  })

  test('uses error component type', () => {
    type ApiError = DevupObject<'error', 'openapi.json'>['ApiError']

    expectTypeOf<ApiError>().toEqualTypeOf<{ message: string; code: number }>()
  })
})

// =============================================================================
// Type Narrowing verification
// =============================================================================

describe('Response type narrowing', () => {
  test('narrows to success type with data check', () => {
    type Response = DevupApiResponse<{ id: number }, { message: string }>

    // if data exists, narrow to success type
    const handleResponse = (res: Response) => {
      if (res.data) {
        // here res.data is { id: number }
        // res.error is undefined
        expectTypeOf(res.data).toEqualTypeOf<{ id: number }>()
        expectTypeOf(res.error).toEqualTypeOf<undefined>()
      }
    }

    expectTypeOf(handleResponse).toBeFunction()
  })

  test('narrows to error type with error check', () => {
    type Response = DevupApiResponse<{ id: number }, { message: string }>

    const handleResponse = (res: Response) => {
      if (res.error) {
        // here res.error is { message: string }
        // res.data is undefined
        expectTypeOf(res.error).toEqualTypeOf<{ message: string }>()
        expectTypeOf(res.data).toEqualTypeOf<undefined>()
      }
    }

    expectTypeOf(handleResponse).toBeFunction()
  })
})

// =============================================================================
// Multi-server support verification
// =============================================================================

describe('Multi-server type separation', () => {
  test('different endpoint types per server', () => {
    // openapi.json server
    type MainUsers = DevupGetApiStruct['openapi.json']['/users']
    expectTypeOf<MainUsers['response']>().toEqualTypeOf<
      { id: number; name: string }[]
    >()

    // admin-api.json server
    type AdminUsers = DevupGetApiStruct['admin-api.json']['/admin/users']
    expectTypeOf<AdminUsers['response']>().toEqualTypeOf<
      { id: number; role: string }[]
    >()
  })

  test('API instance type separation per server', () => {
    const mainApi = createApi({
      baseUrl: 'https://api.example.com',
      serverName: 'openapi.json',
    })
    const adminApi = createApi({
      baseUrl: 'https://admin.example.com',
      serverName: 'admin-api.json',
    })

    // each accesses different server endpoints
    expectTypeOf(mainApi.get).toBeFunction()
    expectTypeOf(adminApi.get).toBeFunction()
  })
})
