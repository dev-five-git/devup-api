# @devup-api/hookform

Type-safe form components for devup-api with react-hook-form integration and automatic Zod validation.

## Installation

```bash
npm install @devup-api/hookform @devup-api/fetch react-hook-form zod
```

## Features

- **Automatic Zod Validation**: Uses Zod schemas generated from your OpenAPI spec
- **FormProvider Integration**: Children can access form context via `useFormContext`
- **Type-Safe**: Full TypeScript support with inferred types from OpenAPI
- **Easy API Submission**: Handles form submission to your API endpoints automatically

## Usage

### Basic Setup

```tsx
import { createApi } from '@devup-api/fetch'
import { ApiForm, useFormContext } from '@devup-api/hookform'

const api = createApi('https://api.example.com')

// Form fields component using form context
function FormFields() {
  const { register, formState: { errors, isSubmitting } } = useFormContext()
  
  return (
    <>
      <input {...register('name')} placeholder="Name" />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register('email')} placeholder="Email" type="email" />
      {errors.email && <span>{errors.email.message}</span>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </>
  )
}

// Main form component
function CreateUserForm() {
  return (
    <ApiForm
      api={api}
      method="post"
      path="createUser"  // operationId or path like '/users'
      onSuccess={(data) => {
        console.log('User created:', data)
      }}
      onError={(error) => {
        console.error('Failed:', error)
      }}
    >
      <FormFields />
    </ApiForm>
  )
}
```

### With Default Values

```tsx
<ApiForm
  api={api}
  method="put"
  path="/users/{id}"
  requestOptions={{ params: { id: '123' } }}
  defaultValues={{
    name: 'John Doe',
    email: 'john@example.com'
  }}
  onSuccess={(data) => console.log('Updated:', data)}
>
  <FormFields />
</ApiForm>
```

### With Validation Mode

```tsx
<ApiForm
  api={api}
  method="post"
  path="createUser"
  mode="onChange"  // Validate on every change
  onValidationError={(errors) => {
    console.log('Validation failed:', errors)
  }}
  onSuccess={(data) => console.log('Created:', data)}
>
  <FormFields />
</ApiForm>
```

### Reset Form After Success

```tsx
<ApiForm
  api={api}
  method="post"
  path="createUser"
  resetOnSuccess={true}
  onSuccess={(data) => console.log('Created:', data)}
>
  <FormFields />
</ApiForm>
```

### Custom Form Props

```tsx
<ApiForm
  api={api}
  method="post"
  path="createUser"
  formProps={{
    className: 'my-form',
    id: 'create-user-form'
  }}
  onSuccess={(data) => console.log('Created:', data)}
>
  <FormFields />
</ApiForm>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `api` | `DevupApi` | The API client instance from `@devup-api/fetch` |
| `method` | `'post' \| 'put' \| 'patch' \| 'delete'` | HTTP method for form submission |
| `path` | `string` | API path or operationId |
| `openapi` | `string` | Server name for multi-server setups (default: 'openapi.json') |
| `requestOptions` | `object` | Additional request options (params, query, headers) |
| `onSuccess` | `(data) => void` | Called when API request succeeds |
| `onError` | `(error) => void` | Called when API request fails |
| `onValidationError` | `(errors) => void` | Called when form validation fails |
| `children` | `ReactNode` | Form content |
| `defaultValues` | `object` | Default values for form fields |
| `mode` | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'` | Validation mode (default: 'onSubmit') |
| `formOptions` | `UseFormProps` | Additional react-hook-form options |
| `formProps` | `FormHTMLAttributes` | HTML form element props |
| `resetOnSuccess` | `boolean` | Reset form after successful submission (default: false) |

## Form Context

Children components can access form context using react-hook-form's `useFormContext`:

```tsx
import { useFormContext } from '@devup-api/hookform'

function FormField({ name }: { name: string }) {
  const { register, formState: { errors } } = useFormContext()
  
  return (
    <div>
      <input {...register(name)} />
      {errors[name] && <span>{errors[name].message}</span>}
    </div>
  )
}
```

## How Validation Works

The `ApiForm` component automatically uses Zod schemas generated from your OpenAPI spec:

1. When you specify a `path` and `method`, the component looks up the corresponding request body schema
2. The schema is used with `@hookform/resolvers/zod` for validation
3. Form submission is blocked if validation fails
4. If no schema is found, the form submits without validation

## Type Safety

All props are fully typed based on your OpenAPI schema:

- `path` is typed to only accept valid paths for the specified method
- `requestOptions` types match the endpoint's params/query/headers
- `onSuccess` receives the typed response data
- `onError` receives the typed error response
- `defaultValues` must match the request body schema

## Re-exported from react-hook-form

For convenience, the following are re-exported from react-hook-form:

- `useFormContext`
- `useWatch`
- `useFieldArray`
- `useController`
- `Controller`

## License

Apache 2.0
