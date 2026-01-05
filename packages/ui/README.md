# @devup-api/ui

CRUD UI components for devup-api with automatic mode detection, React Hook Form integration, and OpenAPI-driven configuration.

## Installation

```bash
npm install @devup-api/ui @devup-api/fetch @tanstack/react-query react-hook-form zod
```

## Features

- **Automatic Mode Detection**: Automatically switches between create and edit mode based on provided params
- **OpenAPI Tag Integration**: Generates CRUD configurations from OpenAPI tags (`devup:{name}:{mode}`)
- **Headless Mode**: Full control with render function pattern
- **Default UI Mode**: Quick setup with field configurations
- **React Query Integration**: Built-in query and mutation state management
- **React Hook Form**: Type-safe form handling with validation
- **Edit Mode Options**: Support for both PUT (`edit`) and PATCH (`fix`) updates

## OpenAPI Tag Configuration

The package uses special OpenAPI tags to define CRUD operations. Tags follow the pattern:

```
devup:{name}:{mode}
```

### Available Modes

| Mode | HTTP Method | Description |
|------|-------------|-------------|
| `one` | GET | Fetch single item (required) |
| `create` | POST | Create new item (required) |
| `edit` | PUT | Full update (optional) |
| `fix` | PATCH | Partial update (optional) |

### Example OpenAPI Spec

```yaml
paths:
  /users/{id}:
    get:
      operationId: getUser
      tags:
        - devup:user:one
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
    put:
      operationId: updateUser
      tags:
        - devup:user:edit
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
    patch:
      operationId: patchUser
      tags:
        - devup:user:fix
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
  /users:
    post:
      operationId: createUser
      tags:
        - devup:user:create
```

### CRUD Group Requirements

For a valid CRUD group, both `one` and `create` modes must be defined. The `edit` and `fix` modes are optional.

## Virtual Module

CRUD configurations are generated at build time and available via a virtual module:

```tsx
import { crudConfigs } from '@devup-api/ui/crud'

// Access individual configs
const userConfig = crudConfigs.user

// Generated config structure:
// {
//   name: 'user',
//   one: { method: 'get', path: '/users/{id}', params: ['id'] },
//   create: { method: 'post', path: '/users', params: [] },
//   edit: { method: 'put', path: '/users/{id}', params: ['id'] },
//   fix: { method: 'patch', path: '/users/{id}', params: ['id'] },
// }
```

## Usage

### ApiCrud Component

#### Create Mode (No Params)

```tsx
import { createApi } from '@devup-api/fetch'
import { ApiCrud } from '@devup-api/ui'
import { crudConfigs } from '@devup-api/ui/crud'

const api = createApi('https://api.example.com')

function CreateUserForm() {
  return (
    <ApiCrud
      config={crudConfigs.user}
      api={api}
      fields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
      ]}
      onCreateSuccess={(data) => {
        console.log('User created:', data)
      }}
    />
  )
}
```

#### Edit Mode (With Params)

```tsx
function EditUserForm({ userId }: { userId: string }) {
  return (
    <ApiCrud
      config={crudConfigs.user}
      api={api}
      params={{ id: userId }}
      fields={[
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
      ]}
      oneLoading={<div>Loading...</div>}
      oneFallback={<div>User not found</div>}
      onUpdateSuccess={(data) => {
        console.log('User updated:', data)
      }}
    />
  )
}
```

#### Using PATCH Instead of PUT

```tsx
<ApiCrud
  config={crudConfigs.user}
  api={api}
  params={{ id: userId }}
  editMode="fix"  // Use PATCH instead of PUT
  fields={fields}
  onUpdateSuccess={(data) => console.log('Patched:', data)}
/>
```

#### Headless Mode (Render Function)

```tsx
<ApiCrud config={crudConfigs.user} api={api} params={{ id: userId }}>
  {({ form, mode, submit, isLoading, one }) => (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <input {...form.register('name')} placeholder="Name" />
      {form.formState.errors.name && (
        <span>{String(form.formState.errors.name.message)}</span>
      )}
      
      <input {...form.register('email')} placeholder="Email" />
      {form.formState.errors.email && (
        <span>{String(form.formState.errors.email.message)}</span>
      )}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : mode === 'create' ? 'Create' : 'Save'}
      </button>
    </form>
  )}
</ApiCrud>
```

#### Custom Field and Submit Rendering

```tsx
<ApiCrud
  config={crudConfigs.user}
  api={api}
  fields={[
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
  ]}
  renderField={(field, form) => (
    <div key={field.name} className="form-field">
      <label htmlFor={field.name}>{field.label}</label>
      <input
        id={field.name}
        {...form.register(field.name)}
        placeholder={field.placeholder}
        className="input"
      />
    </div>
  )}
  renderSubmit={({ isLoading, mode }) => (
    <button type="submit" disabled={isLoading} className="btn-primary">
      {isLoading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
    </button>
  )}
  formProps={{ className: 'user-form' }}
/>
```

### useApiCrud Hook

For complete control, use the hook directly:

```tsx
import { useApiCrud } from '@devup-api/ui'
import { crudConfigs } from '@devup-api/ui/crud'

function UserForm({ userId }: { userId?: string }) {
  const crud = useApiCrud({
    config: crudConfigs.user,
    api,
    params: userId ? { id: userId } : undefined,
    onCreateSuccess: (data) => console.log('Created:', data),
    onUpdateSuccess: (data) => console.log('Updated:', data),
  })

  if (crud.mode === 'edit' && crud.one.isLoading) {
    return <div>Loading...</div>
  }

  if (crud.mode === 'edit' && crud.one.isError) {
    return <div>Error loading user</div>
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); crud.submit(); }}>
      <input {...crud.form.register('name')} />
      <input {...crud.form.register('email')} />
      
      <button type="submit" disabled={crud.isLoading}>
        {crud.mode === 'create' ? 'Create' : 'Save'}
      </button>
    </form>
  )
}
```

## Props

### ApiCrud Component Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `CrudConfig` | CRUD configuration from generated configs |
| `api` | `DevupApi` | API client instance from `@devup-api/fetch` |
| `params` | `Record<string, unknown>` | Path parameters - if provided, enables edit mode |
| `editMode` | `'edit' \| 'fix'` | Which update method to use (PUT or PATCH) |
| `fields` | `FieldConfig[]` | Field configurations for default UI rendering |
| `defaultValues` | `object` | Default values for create mode |
| `onCreateSuccess` | `(data) => void` | Called when create succeeds |
| `onUpdateSuccess` | `(data) => void` | Called when edit/fix succeeds |
| `onOneError` | `(error) => void` | Called when GET fails |
| `onCreateError` | `(error) => void` | Called when create fails |
| `onUpdateError` | `(error) => void` | Called when edit/fix fails |
| `oneFallback` | `ReactNode` | Fallback UI when GET fails |
| `oneLoading` | `ReactNode` | Loading UI while GET is loading |
| `children` | `ReactNode \| ((props) => ReactNode)` | Children or render function for headless mode |
| `renderField` | `(field, form) => ReactNode` | Custom field renderer |
| `renderSubmit` | `(props) => ReactNode` | Custom submit button renderer |
| `formProps` | `FormHTMLAttributes` | HTML form element props |
| `queryClient` | `QueryClient` | Custom React Query client |

### FieldConfig Type

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Field name (path in form data) |
| `label` | `string` | Display label |
| `type` | `FieldType` | Field type for UI rendering |
| `required` | `boolean` | Whether the field is required |
| `placeholder` | `string` | Placeholder text |
| `defaultValue` | `unknown` | Default value |
| `validation` | `object` | Validation constraints (min, max, minLength, maxLength, pattern, options) |
| `children` | `FieldConfig[]` | Nested fields for object/array types |
| `description` | `string` | Help text |

### FieldType Values

`text` | `number` | `email` | `password` | `url` | `tel` | `textarea` | `select` | `checkbox` | `radio` | `date` | `datetime` | `time` | `file` | `hidden` | `array` | `object`

### useApiCrud Return Type

| Property | Type | Description |
|----------|------|-------------|
| `mode` | `'create' \| 'edit'` | Current operation mode |
| `one` | `object` | GET query state (data, isLoading, isError, error, refetch) |
| `create` | `object` | Create mutation state (mutate, mutateAsync, isPending, isSuccess, isError, error, reset) |
| `update` | `object` | Update mutation state (mutate, mutateAsync, isPending, isSuccess, isError, error, reset) |
| `form` | `UseFormReturn` | React Hook Form instance |
| `fields` | `FieldConfig[]` | Field configurations |
| `submit` | `() => void` | Submit handler |
| `isLoading` | `boolean` | Whether any operation is in progress |

## Type Exports

```tsx
import type {
  // Component Props
  ApiCrudComponentProps,
  ApiCrudProps,
  ApiCrudRenderProps,
  
  // CRUD Configuration
  CrudConfig,
  CrudConfigs,
  CrudEndpoint,
  CrudMode,
  EditMode,
  
  // Field Configuration
  FieldConfig,
  FieldType,
  
  // Hook Types
  UseApiCrudOptions,
  UseApiCrudReturn,
  UseApiCrudHookOptions,
  UseApiCrudResult,
  
  // Module Augmentation
  DevupCrudConfigs,
} from '@devup-api/ui'
```

## Utility Functions

### analyzeSchema

Analyze a Zod schema and extract field configurations:

```tsx
import { analyzeSchema } from '@devup-api/ui'
import { z } from 'zod'

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
})

const fields = analyzeSchema(userSchema)
// [
//   { name: 'name', label: 'Name', type: 'text', required: true },
//   { name: 'email', label: 'Email', type: 'email', required: true },
//   { name: 'age', label: 'Age', type: 'number', required: false },
// ]
```

### getDefaultValues

Get default values from field configurations:

```tsx
import { getDefaultValues } from '@devup-api/ui'

const defaults = getDefaultValues(fields)
// { age: 0 }
```

## License

Apache 2.0
