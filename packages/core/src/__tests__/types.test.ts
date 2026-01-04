/**
 * Type tests for core utility types
 * Verify that utility type transformations work correctly
 */
import { describe, expectTypeOf, test } from 'bun:test'
import type {
  Additional,
  ApiOption,
  BoildApiOption,
  ExtractValue,
  RequiredOptions,
} from '../additional'
import type {
  DevupDeleteApiStruct,
  DevupGetApiStruct,
  DevupGetApiStructKey,
  DevupObject,
  DevupPatchApiStruct,
  DevupPostApiStruct,
  DevupPostApiStructKey,
  DevupPutApiStruct,
} from '../api-struct'

// =============================================================================
// Test Fixtures
// =============================================================================

declare module '../api-struct' {
  interface DevupApiServers {
    'test-api.json': never
  }

  interface DevupGetApiStruct {
    'test-api.json': {
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
      getUser: {
        params: { id: string }
        response: { id: number; name: string }
        error: { message: string }
      }
    }
  }

  interface DevupPostApiStruct {
    'test-api.json': {
      '/users': {
        body: { name: string; email: string }
        response: { id: number; name: string }
        error: { message: string }
      }
    }
  }

  interface DevupPutApiStruct {
    'test-api.json': {
      '/users/{id}': {
        params: { id: string }
        body: { name: string; email: string }
        response: { id: number }
        error: { message: string }
      }
    }
  }

  interface DevupDeleteApiStruct {
    'test-api.json': {
      '/users/{id}': {
        params: { id: string }
        response: { success: boolean }
        error: { message: string }
      }
    }
  }

  interface DevupPatchApiStruct {
    'test-api.json': {
      '/users/{id}': {
        params: { id: string }
        body: { name?: string; email?: string }
        response: { id: number }
        error: { message: string }
      }
    }
  }

  interface DevupRequestComponentStruct {
    'test-api.json': {
      CreateUserRequest: { name: string; email: string }
      UpdateUserRequest: { name?: string; email?: string }
    }
  }

  interface DevupResponseComponentStruct {
    'test-api.json': {
      User: { id: number; name: string; email: string }
      UserList: { id: number; name: string }[]
    }
  }

  interface DevupErrorComponentStruct {
    'test-api.json': {
      ApiError: { code: string; message: string }
      NotFoundError: { message: string; resource: string }
    }
  }
}

// =============================================================================
// ExtractValue - Verify value extraction from nested types
// =============================================================================

describe('ExtractValue', () => {
  test('extracts response type from endpoint', () => {
    type Endpoint = DevupGetApiStruct['test-api.json']['/users']
    type Response = ExtractValue<Endpoint, 'response'>

    // response type should be extracted correctly
    expectTypeOf<Response>().toEqualTypeOf<{ id: number; name: string }[]>()
  })

  test('extracts error type from endpoint', () => {
    type Endpoint = DevupGetApiStruct['test-api.json']['/users/{id}']
    type Error = ExtractValue<Endpoint, 'error'>

    expectTypeOf<Error>().toEqualTypeOf<{ message: string; code: number }>()
  })

  test('extracts params type from endpoint', () => {
    type Endpoint = DevupGetApiStruct['test-api.json']['/users/{id}']
    type Params = ExtractValue<Endpoint, 'params'>

    expectTypeOf<Params>().toEqualTypeOf<{ id: string }>()
  })

  test('returns fallback for non-existent key', () => {
    type Endpoint = DevupGetApiStruct['test-api.json']['/users']
    type Body = ExtractValue<Endpoint, 'body', never>

    expectTypeOf<Body>().toBeNever()
  })
})

// =============================================================================
// Additional - Verify type lookup by endpoint key
// =============================================================================

describe('Additional', () => {
  test('looks up endpoint type by existing path', () => {
    type Scope = DevupGetApiStruct['test-api.json']
    type Result = Additional<'/users', Scope>

    // should return the full type of /users endpoint
    expectTypeOf<Result>().toHaveProperty('response')
    expectTypeOf<Result>().toHaveProperty('error')
  })

  test('returns empty object for non-existent path', () => {
    type Scope = DevupGetApiStruct['test-api.json']
    type Result = Additional<'/nonexistent', Scope>

    expectTypeOf<Result>().toEqualTypeOf<object>()
  })

  test('looks up endpoint type by operationId', () => {
    type Scope = DevupGetApiStruct['test-api.json']
    type Result = Additional<'getUser', Scope>

    expectTypeOf<Result>().toHaveProperty('params')
    expectTypeOf<Result>().toHaveProperty('response')
  })
})

// =============================================================================
// RequiredOptions - Determine if params/query/body are required
// =============================================================================

describe('RequiredOptions', () => {
  test('options required when params exist', () => {
    type Endpoint = { params: { id: string }; response: { data: string } }
    type Result = RequiredOptions<Endpoint>

    // not never = options required
    expectTypeOf<Result>().not.toBeNever()
    expectTypeOf<Result>().toEqualTypeOf<Endpoint>()
  })

  test('options required when body exists', () => {
    type Endpoint = { body: { name: string }; response: { id: number } }
    type Result = RequiredOptions<Endpoint>

    expectTypeOf<Result>().not.toBeNever()
  })

  test('options required when query exists', () => {
    type Endpoint = { query: { page: number }; response: { data: string } }
    type Result = RequiredOptions<Endpoint>

    expectTypeOf<Result>().not.toBeNever()
  })

  test('options optional when no params/query/body', () => {
    type Endpoint = { response: { data: string }; error: { message: string } }
    type Result = RequiredOptions<Endpoint>

    // never = options not required
    expectTypeOf<Result>().toBeNever()
  })
})

// =============================================================================
// BoildApiOption - Generate API options from endpoint
// =============================================================================

describe('BoildApiOption', () => {
  test('includes params/body/query, excludes response/error', () => {
    type Endpoint = {
      params: { id: string }
      body: { name: string }
      response: { data: string }
      error: { message: string }
    }
    type Result = BoildApiOption<Endpoint>

    // params, body are included
    expectTypeOf<Result>().toHaveProperty('params')
    expectTypeOf<Result>().toHaveProperty('body')

    // DevupApiRequestInit properties are also included
    expectTypeOf<Result>().toHaveProperty('headers')
  })
})

// =============================================================================
// ApiOption - Generate required/optional option tuple
// =============================================================================

describe('ApiOption', () => {
  test('required option tuple when params exist', () => {
    type Endpoint = { params: { id: string }; response: string }
    type Result = ApiOption<Endpoint>

    // [options: BoildApiOption<Endpoint>] format
    expectTypeOf<Result>().toEqualTypeOf<[BoildApiOption<Endpoint>]>()
  })

  test('required option tuple when body exists', () => {
    type Endpoint = { body: { name: string }; response: string }
    type Result = ApiOption<Endpoint>

    expectTypeOf<Result>().toEqualTypeOf<[BoildApiOption<Endpoint>]>()
  })

  test('optional option tuple when no params/body/query', () => {
    type Endpoint = { response: string }
    type Result = ApiOption<Endpoint>

    // [options?: ...] format - length is 0 or 1
    type IsOptional = Result extends [options?: infer _] ? true : false
    expectTypeOf<IsOptional>().toEqualTypeOf<true>()
  })
})

// =============================================================================
// DevupApiStructKey - Extract endpoint keys by HTTP method
// =============================================================================

describe('DevupApiStructKey', () => {
  test('extracts GET endpoint keys', () => {
    type Keys = DevupGetApiStructKey<'test-api.json'>

    // should include all defined GET endpoints
    type HasUsers = '/users' extends Keys ? true : false
    type HasUserId = '/users/{id}' extends Keys ? true : false
    type HasGetUser = 'getUser' extends Keys ? true : false

    expectTypeOf<HasUsers>().toEqualTypeOf<true>()
    expectTypeOf<HasUserId>().toEqualTypeOf<true>()
    expectTypeOf<HasGetUser>().toEqualTypeOf<true>()
  })

  test('extracts POST endpoint keys', () => {
    type Keys = DevupPostApiStructKey<'test-api.json'>

    type HasUsers = '/users' extends Keys ? true : false
    expectTypeOf<HasUsers>().toEqualTypeOf<true>()
  })
})

// =============================================================================
// DevupObject - Access component schemas
// =============================================================================

describe('DevupObject', () => {
  test('accesses response component', () => {
    type User = DevupObject<'response', 'test-api.json'>['User']

    expectTypeOf<User>().toEqualTypeOf<{
      id: number
      name: string
      email: string
    }>()
  })

  test('accesses request component', () => {
    type CreateUser = DevupObject<
      'request',
      'test-api.json'
    >['CreateUserRequest']

    expectTypeOf<CreateUser>().toEqualTypeOf<{ name: string; email: string }>()
  })

  test('accesses error component', () => {
    type ApiError = DevupObject<'error', 'test-api.json'>['ApiError']

    expectTypeOf<ApiError>().toEqualTypeOf<{ code: string; message: string }>()
  })

  test('uses component types in function signatures', () => {
    type User = DevupObject<'response', 'test-api.json'>['User']
    type CreateUserRequest = DevupObject<
      'request',
      'test-api.json'
    >['CreateUserRequest']

    // should be usable as types in actual functions
    const createUser = (data: CreateUserRequest): User => ({
      id: 1,
      name: data.name,
      email: data.email,
    })

    // verify with Parameters<T> and ReturnType<T> utility types
    expectTypeOf<
      Parameters<typeof createUser>[0]
    >().toEqualTypeOf<CreateUserRequest>()
    expectTypeOf<ReturnType<typeof createUser>>().toEqualTypeOf<User>()
  })
})

// =============================================================================
// HTTP Method Endpoint Structure Verification
// =============================================================================

describe('HTTP Method Structs', () => {
  test('GET endpoint - response/error required, params/query optional', () => {
    type Endpoint = DevupGetApiStruct['test-api.json']['/users/{id}']

    expectTypeOf<Endpoint['response']>().toEqualTypeOf<{
      id: number
      name: string
      email: string
    }>()
    expectTypeOf<Endpoint['error']>().toEqualTypeOf<{
      message: string
      code: number
    }>()
    expectTypeOf<Endpoint['params']>().toEqualTypeOf<{ id: string }>()
  })

  test('POST endpoint - body required', () => {
    type Endpoint = DevupPostApiStruct['test-api.json']['/users']

    expectTypeOf<Endpoint['body']>().toEqualTypeOf<{
      name: string
      email: string
    }>()
    expectTypeOf<Endpoint['response']>().toEqualTypeOf<{
      id: number
      name: string
    }>()
  })

  test('PUT endpoint - params and body required', () => {
    type Endpoint = DevupPutApiStruct['test-api.json']['/users/{id}']

    expectTypeOf<Endpoint['params']>().toEqualTypeOf<{ id: string }>()
    expectTypeOf<Endpoint['body']>().toEqualTypeOf<{
      name: string
      email: string
    }>()
  })

  test('DELETE endpoint - params required', () => {
    type Endpoint = DevupDeleteApiStruct['test-api.json']['/users/{id}']

    expectTypeOf<Endpoint['params']>().toEqualTypeOf<{ id: string }>()
    expectTypeOf<Endpoint['response']>().toEqualTypeOf<{ success: boolean }>()
  })

  test('PATCH endpoint - body for partial update', () => {
    type Endpoint = DevupPatchApiStruct['test-api.json']['/users/{id}']

    expectTypeOf<Endpoint['body']>().toEqualTypeOf<{
      name?: string
      email?: string
    }>()
  })
})
