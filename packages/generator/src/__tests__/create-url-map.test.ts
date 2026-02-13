/** biome-ignore-all lint/style/noNonNullAssertion: test code */
import { describe, expect, test } from 'bun:test'
import type { UrlMapValue } from '@devup-api/core'
import type { OpenAPIV3_1 } from 'openapi-types'
import { createUrlMap } from '../create-url-map'

test.each([
  [
    'camel',
    undefined,
    'get_users',
    {
      getUsers: { method: 'GET', url: '/users' },
      '/users': { method: 'GET', url: '/users' },
    },
  ],
  [
    'snake',
    { convertCase: 'snake' as const },
    'getUsers',
    {
      get_users: { method: 'GET', url: '/users' },
      '/users': { method: 'GET', url: '/users' },
    },
  ],
  [
    'pascal',
    { convertCase: 'pascal' as const },
    'get_users',
    {
      GetUsers: { method: 'GET', url: '/users' },
      '/users': { method: 'GET', url: '/users' },
    },
  ],
  [
    'maintain',
    { convertCase: 'maintain' as const },
    'get_users',
    {
      get_users: { method: 'GET', url: '/users' },
      '/users': { method: 'GET', url: '/users' },
    },
  ],
])('creates url map with %s case conversion', (_, options, operationId, expected) => {
  const schema: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/users': {
        get: {
          operationId,
          responses: {},
        },
      },
    },
  }

  const result = createUrlMap({ '': schema }, options)

  expect(result).toEqual({ '': expected } as Record<
    string,
    Record<string, UrlMapValue>
  >)
})

test('converts path parameters based on convertCase', () => {
  const schema: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/users/{user_id}/posts/{post_id}': {
        get: {
          operationId: 'get_user_post',
          responses: {},
        },
      },
    },
  }

  const result = createUrlMap({ '': schema }, { convertCase: 'camel' })

  expect(result).toEqual({
    '': {
      getUserPost: {
        method: 'GET',
        url: '/users/{userId}/posts/{postId}',
      },
      '/users/{userId}/posts/{postId}': {
        method: 'GET',
        url: '/users/{userId}/posts/{postId}',
      },
    },
  })
})

test.each([
  ['get', 'get_users', 'getUsers', 'GET'],
  ['post', 'create_user', 'createUser', 'POST'],
  ['put', 'update_user', 'updateUser', 'PUT'],
  ['delete', 'delete_user', 'deleteUser', 'DELETE'],
  ['patch', 'patch_user', 'patchUser', 'PATCH'],
])('handles %s HTTP method', (method, operationId, expectedKey, expectedMethod) => {
  const schema: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/users': {
        [method]: {
          operationId,
          responses: {},
        },
      },
    },
  }

  const result = createUrlMap({ '': schema })

  expect(result['']).toHaveProperty(expectedKey)
  expect(result['']![expectedKey]?.method).toBe(
    expectedMethod as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  )
  expect(result['']).toHaveProperty('/users')
  expect(result['']!['/users']?.method).toBe(
    expectedMethod as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  )
})

test('handles operation without operationId', () => {
  const schema: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/users': {
        get: {
          responses: {},
        },
      },
    },
  }

  const result = createUrlMap({ '': schema })

  expect(result).toEqual({
    '': {
      '/users': {
        method: 'GET',
        url: '/users',
      },
    },
  })
  expect(result['']).not.toHaveProperty('getUsers')
})

test('handles multiple paths', () => {
  const schema: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/users': {
        get: {
          operationId: 'get_users',
          responses: {},
        },
      },
      '/posts': {
        get: {
          operationId: 'get_posts',
          responses: {},
        },
      },
    },
  }

  const result = createUrlMap({ '': schema })

  expect(result['']).toHaveProperty('getUsers')
  expect(result['']).toHaveProperty('getPosts')
  expect(result['']).toHaveProperty('/users')
  expect(result['']).toHaveProperty('/posts')
})

test('handles empty paths', () => {
  const schema: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {},
  }

  const result = createUrlMap({ '': schema })

  expect(result).toEqual({ '': {} })
})

test('handles undefined paths', () => {
  const schema: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    components: {},
    paths: {},
  }

  const result = createUrlMap({ '': schema })

  expect(result).toEqual({ '': {} })
})

test('handles undefined pathItem', () => {
  const schema: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/users': undefined,
    },
  }

  const result = createUrlMap({ '': schema })

  expect(result).toEqual({ '': {} })
})

test('skips operations that do not exist', () => {
  const schema: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/users': {
        get: {
          operationId: 'get_users',
          responses: {},
        },
        // post, put, delete, patch are not defined
      },
    },
  }

  const result = createUrlMap({ '': schema })

  expect(result).toEqual({
    '': {
      getUsers: {
        method: 'GET',
        url: '/users',
      },
      '/users': {
        method: 'GET',
        url: '/users',
      },
    },
  })
})

test('handles complex path with multiple parameters', () => {
  const schema: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/api/v1/users/{user_id}/posts/{post_id}/comments/{comment_id}': {
        get: {
          operationId: 'get_user_post_comment',
          responses: {},
        },
      },
    },
  }

  const result = createUrlMap({ '': schema }, { convertCase: 'snake' })

  expect(result).toEqual({
    '': {
      get_user_post_comment: {
        method: 'GET',
        url: '/api/v1/users/{user_id}/posts/{post_id}/comments/{comment_id}',
      },
      '/api/v1/users/{user_id}/posts/{post_id}/comments/{comment_id}': {
        method: 'GET',
        url: '/api/v1/users/{user_id}/posts/{post_id}/comments/{comment_id}',
      },
    },
  })
})

test.each([
  ['camel', '/users/{userId}', '/users/{userId}'],
  ['snake', '/users/{user_id}', '/users/{user_id}'],
  ['pascal', '/users/{UserId}', '/users/{UserId}'],
])('converts path parameters with %s case: %s', (caseType, expectedPath, expectedUrl) => {
  const schema: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/users/{user_id}': {
        get: {
          operationId: 'get_user',
          responses: {},
        },
      },
    },
  }

  const result = createUrlMap(
    { '': schema },
    {
      convertCase: caseType as 'camel' | 'snake' | 'pascal',
    },
  )

  expect(result[''][expectedPath]?.url).toBe(expectedUrl)
})

test.each([
  ['camel', 'getUserList'],
  ['snake', 'get_user_list'],
  ['pascal', 'GetUserList'],
])('converts operationId with %s case: %s', (caseType, expectedKey) => {
  const schema: OpenAPIV3_1.Document = {
    openapi: '3.1.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/users': {
        get: {
          operationId: 'get_user_list',
          responses: {},
        },
      },
    },
  }

  const result = createUrlMap(
    { '': schema },
    {
      convertCase: caseType as 'camel' | 'snake' | 'pascal',
    },
  )

  expect(result['']).toHaveProperty(expectedKey)
})

describe('bodyType emission', () => {
  test('emits bodyType: form for application/x-www-form-urlencoded endpoint', () => {
    const schema: OpenAPIV3_1.Document = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/form': {
          post: {
            operationId: 'subscribe',
            requestBody: {
              content: {
                'application/x-www-form-urlencoded': {
                  schema: {
                    $ref: '#/components/schemas/SubscribeRequest',
                  },
                },
              },
            },
            responses: {},
          },
        },
      },
    }

    const result = createUrlMap({ '': schema })

    expect(result['']!.subscribe).toEqual({
      method: 'POST',
      url: '/form',
      bodyType: 'form',
    })
    expect(result['']!['/form']).toEqual({
      method: 'POST',
      url: '/form',
      bodyType: 'form',
    })
  })

  test('emits bodyType: multipart for multipart/form-data endpoint', () => {
    const schema: OpenAPIV3_1.Document = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/upload': {
          post: {
            operationId: 'upload_file',
            requestBody: {
              content: {
                'multipart/form-data': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
            responses: {},
          },
        },
      },
    }

    const result = createUrlMap({ '': schema })

    expect(result['']!.uploadFile).toEqual({
      method: 'POST',
      url: '/upload',
      bodyType: 'multipart',
    })
    expect(result['']!['/upload']).toEqual({
      method: 'POST',
      url: '/upload',
      bodyType: 'multipart',
    })
  })

  test('does NOT emit bodyType for application/json endpoint', () => {
    const schema: OpenAPIV3_1.Document = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          post: {
            operationId: 'create_user',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/CreateUserRequest',
                  },
                },
              },
            },
            responses: {},
          },
        },
      },
    }

    const result = createUrlMap({ '': schema })

    expect(result['']!.createUser).toEqual({
      method: 'POST',
      url: '/users',
    })
    expect(result['']!.createUser).not.toHaveProperty('bodyType')
    expect(result['']!['/users']).not.toHaveProperty('bodyType')
  })

  test('does NOT emit bodyType for GET endpoint without requestBody', () => {
    const schema: OpenAPIV3_1.Document = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            operationId: 'get_users',
            responses: {},
          },
        },
      },
    }

    const result = createUrlMap({ '': schema })

    expect(result['']!.getUsers).toEqual({
      method: 'GET',
      url: '/users',
    })
    expect(result['']!.getUsers).not.toHaveProperty('bodyType')
  })

  test('resolves $ref in requestBody to detect content type', () => {
    const schema: OpenAPIV3_1.Document = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/form': {
          post: {
            operationId: 'submit_form',
            requestBody: {
              $ref: '#/components/requestBodies/FormBody',
            },
            responses: {},
          },
        },
      },
      components: {
        requestBodies: {
          FormBody: {
            content: {
              'application/x-www-form-urlencoded': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    }

    const result = createUrlMap({ '': schema })

    expect(result['']!.submitForm).toEqual({
      method: 'POST',
      url: '/form',
      bodyType: 'form',
    })
  })

  test('resolves $ref in requestBody for multipart content type', () => {
    const schema: OpenAPIV3_1.Document = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/upload': {
          post: {
            operationId: 'upload_file',
            requestBody: {
              $ref: '#/components/requestBodies/UploadBody',
            },
            responses: {},
          },
        },
      },
      components: {
        requestBodies: {
          UploadBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
        },
      },
    }

    const result = createUrlMap({ '': schema })

    expect(result['']!.uploadFile).toEqual({
      method: 'POST',
      url: '/upload',
      bodyType: 'multipart',
    })
  })

  test('handles mixed endpoints with different body types', () => {
    const schema: OpenAPIV3_1.Document = {
      openapi: '3.1.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          post: {
            operationId: 'create_user',
            requestBody: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            responses: {},
          },
        },
        '/form': {
          post: {
            operationId: 'subscribe',
            requestBody: {
              content: {
                'application/x-www-form-urlencoded': {
                  schema: { $ref: '#/components/schemas/SubscribeRequest' },
                },
              },
            },
            responses: {},
          },
        },
        '/upload': {
          post: {
            operationId: 'upload_file',
            requestBody: {
              content: {
                'multipart/form-data': {
                  schema: { type: 'object' },
                },
              },
            },
            responses: {},
          },
        },
      },
    }

    const result = createUrlMap({ '': schema })

    // JSON endpoint: no bodyType
    expect(result['']!.createUser).not.toHaveProperty('bodyType')
    // Form endpoint: bodyType = 'form'
    expect(result['']!.subscribe!.bodyType).toBe('form')
    // Multipart endpoint: bodyType = 'multipart'
    expect(result['']!.uploadFile!.bodyType).toBe('multipart')
  })
})

// getBodyType is now internal (not exported) — tested indirectly through createUrlMap tests above
