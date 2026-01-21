---
name: devup-api
description: |
  Type-safe API client generator from OpenAPI schemas with full ecosystem support.
  
  TRIGGER WHEN:
  - Setting up API client with OpenAPI schema (@devup-api/fetch)
  - Making typed API requests (GET, POST, PUT, PATCH, DELETE)
  - Using React Query hooks (@devup-api/react-query)
  - Using Zod validation schemas (@devup-api/zod)
  - Building forms with react-hook-form (@devup-api/hookform)
  - Creating CRUD interfaces (@devup-api/ui)
  - Configuring Vite/Next.js/Webpack/Rsbuild plugins
  - Implementing authentication middleware
  - Using DevupObject for type references
---

# devup-api

Type-safe API client from OpenAPI. Zero generics, auto-generated types.

## Important: No Type Assertions

**NEVER use `as` keyword with devup-api types.** The library uses two-phase typing:
- **Cold typing**: Before build, all types are `any` - no type errors possible
- **Boild typing**: After build, types are fully inferred from OpenAPI

Type assertions (`as`) are unnecessary and may hide real issues. Let the generated types flow naturally.

```ts
// WRONG
const user = result.data as User

// CORRECT
const user = result.data  // Type inferred automatically
```

---

## Quick Setup

```bash
# Core + Plugin (pick one)
npm install @devup-api/fetch @devup-api/vite-plugin    # Vite
npm install @devup-api/fetch @devup-api/next-plugin    # Next.js

# Optional
npm install @devup-api/react-query @tanstack/react-query
npm install @devup-api/zod zod
npm install @devup-api/hookform react-hook-form zod
npm install @devup-api/ui @tanstack/react-query react-hook-form zod
```

**Configure plugin:**
```ts
// vite.config.ts
import devupApi from '@devup-api/vite-plugin'
export default defineConfig({ plugins: [devupApi()] })

// next.config.ts
import devupApi from '@devup-api/next-plugin'
export default devupApi({ reactStrictMode: true })
```

**tsconfig.json:** Add `"df/**/*.d.ts"` to `include`.

Place `openapi.json` in project root, run `npm run dev`.

---

## @devup-api/fetch

```ts
import { createApi, type DevupObject } from '@devup-api/fetch'

const api = createApi('https://api.example.com')
// or: createApi({ baseUrl: '...', headers: {...} })
```

### Requests

```ts
// GET - operationId or path
const users = await api.get('getUsers', { query: { page: 1 } })
const user = await api.get('/users/{id}', { params: { id: '123' } })

// POST/PUT/PATCH/DELETE
await api.post('createUser', { body: { name: 'John' } })
await api.put('/users/{id}', { params: { id: '1' }, body: {...} })
await api.patch('/users/{id}', { params: { id: '1' }, body: {...} })
await api.delete('/users/{id}', { params: { id: '1' } })
```

### Response

```ts
const result = await api.get('getUser', { params: { id: '1' } })
if (result.data) console.log(result.data.name)
if (result.error) console.error(result.error)
// result.response = raw Response
```

### DevupObject (Type References)

```ts
// Direct type annotations without redefining
const user: DevupObject['User'] = await fetchUser()
const body: DevupObject<'request'>['CreateUserBody'] = {...}
const error: DevupObject<'error'>['ErrorResponse'] = result.error

function UserCard({ user }: { user: DevupObject['User'] }) {...}

// Multi-server
const product: DevupObject<'response', 'openapi2.json'>['Product'] = data
```

### Middleware

```ts
api.use({
  onRequest: async ({ request }) => {
    const headers = new Headers(request.headers)
    headers.set('Authorization', `Bearer ${token}`)
    return new Request(request, { headers })
  },
  onResponse: async ({ request, response }) => {
    if (response.status === 401) {
      const newToken = await refreshToken()
      const headers = new Headers(request.headers)
      headers.set('Authorization', `Bearer ${newToken}`)
      return fetch(new Request(request, { headers }))
    }
  }
})
```

---

## @devup-api/react-query

```ts
import { createApi } from '@devup-api/fetch'
import { createQueryClient } from '@devup-api/react-query'

const api = createApi('https://api.example.com')
const queryClient = createQueryClient(api)
```

### useQuery

```tsx
const { data, isLoading, error } = queryClient.useQuery(
  'get', '/users/{id}',
  { params: { id: userId } },
  { staleTime: 5 * 60 * 1000 }  // React Query options
)
```

### useMutation

```tsx
const mutation = queryClient.useMutation('post', 'createUser', {
  onSuccess: () => tanstackQueryClient.invalidateQueries({ queryKey: ['get', 'getUsers'] })
})
mutation.mutate({ body: { name: 'John' } })
```

### useSuspenseQuery / useInfiniteQuery / useQueries

```tsx
// Suspense
const { data } = queryClient.useSuspenseQuery('get', 'getUsers', {})

// Infinite
const { data, fetchNextPage } = queryClient.useInfiniteQuery('get', 'getUsers', {
  initialPageParam: 1,
  getNextPageParam: (lastPage) => lastPage.nextPage
})

// Parallel
const results = queryClient.useQueries([
  ['get', '/users/{id}', { params: { id: '1' } }],
  ['get', '/users/{id}', { params: { id: '2' } }],
])
```

---

## @devup-api/zod

Auto-generated Zod schemas from OpenAPI via virtual module.

```ts
import { schemas, responseSchemas, requestSchemas, pathSchemas } from '@devup-api/zod'

const userSchema = responseSchemas.User
const createSchema = requestSchemas.CreateUserRequest
const formSchema = pathSchemas.post['createUser']  // For forms

const result = userSchema.safeParse(data)
type User = z.infer<typeof responseSchemas.User>
```

---

## @devup-api/hookform

Auto-validation with Zod schemas from OpenAPI.

```tsx
import { ApiForm, useFormContext } from '@devup-api/hookform'

function FormFields() {
  const { register, formState: { errors } } = useFormContext()
  return (
    <>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <button type="submit">Submit</button>
    </>
  )
}

// Create
<ApiForm api={api} method="post" path="createUser" onSuccess={...}>
  <FormFields />
</ApiForm>

// Edit
<ApiForm
  api={api}
  method="put"
  path="/users/{id}"
  requestOptions={{ params: { id: '123' } }}
  defaultValues={{ name: 'John' }}
  mode="onChange"
  resetOnSuccess
  onSuccess={...}
>
  <FormFields />
</ApiForm>
```

**Props:** `api`, `method`, `path`, `requestOptions`, `defaultValues`, `mode`, `resetOnSuccess`, `onSuccess`, `onError`, `onValidationError`

---

## @devup-api/ui

Auto-generated CRUD from OpenAPI tags.

### OpenAPI Tags

```yaml
paths:
  /users/{id}:
    get:
      tags: [devup:user:one]      # Required: GET single
    put:
      tags: [devup:user:edit]     # Optional: PUT update
    patch:
      tags: [devup:user:fix]      # Optional: PATCH update
  /users:
    post:
      tags: [devup:user:create]   # Required: POST create
```

### Usage

```tsx
import { ApiCrud } from '@devup-api/ui'
import { crudConfigs } from '@devup-api/ui/crud'

// Create mode (no params)
<ApiCrud
  config={crudConfigs.user}
  api={api}
  fields={[
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
  ]}
  onCreateSuccess={(data) => console.log('Created:', data)}
/>

// Edit mode (with params)
<ApiCrud
  config={crudConfigs.user}
  api={api}
  params={{ id: userId }}
  editMode="fix"  // 'edit' (PUT) or 'fix' (PATCH)
  fields={fields}
  oneLoading={<div>Loading...</div>}
  onUpdateSuccess={(data) => console.log('Updated:', data)}
/>

// Headless mode
<ApiCrud config={crudConfigs.user} api={api} params={{ id: userId }}>
  {({ form, mode, submit, isLoading }) => (
    <form onSubmit={(e) => { e.preventDefault(); submit() }}>
      <input {...form.register('name')} />
      <button disabled={isLoading}>{mode === 'create' ? 'Create' : 'Save'}</button>
    </form>
  )}
</ApiCrud>
```

### useApiCrud Hook

```tsx
const crud = useApiCrud({
  config: crudConfigs.user,
  api,
  params: userId ? { id: userId } : undefined,
  onCreateSuccess: (data) => {...},
  onUpdateSuccess: (data) => {...},
})
// crud.mode, crud.form, crud.one, crud.create, crud.update, crud.submit, crud.isLoading
```

**Field types:** `text` | `number` | `email` | `password` | `textarea` | `select` | `checkbox` | `radio` | `date` | `datetime` | `file` | `array` | `object`

---

## Multi-Server

```ts
devupApi({ openapiFiles: ['openapi.json', 'openapi2.json'] })

const api2 = createApi({ baseUrl: '...', serverName: 'openapi2.json' })
const product: DevupObject<'response', 'openapi2.json'>['Product'] = data
```

---

## Plugin Options

```ts
interface DevupApiOptions {
  openapiFiles?: string | string[]           // default: 'openapi.json'
  tempDir?: string                           // default: 'df'
  convertCase?: 'snake' | 'camel' | 'pascal' | 'maintain'  // default: 'camel'
  requestDefaultNonNullable?: boolean        // default: false
  responseDefaultNonNullable?: boolean       // default: true
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Types not appearing | Run `npm run dev`, check tsconfig includes `df/**/*.d.ts` |
| operationId not found | Use path `/users/{id}` or verify openapi.json |
| Zod schemas empty | Ensure bundler plugin is configured |
| CRUD config missing | Add `devup:{name}:one` and `devup:{name}:create` tags |
