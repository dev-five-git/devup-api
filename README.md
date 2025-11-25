# Devup API

**A fully typed API client generator powered by OpenAPI.  
Fetch-compatible, auto-generated types, zero generics required.**

Devup API reads your `openapi.json` file and automatically generates a fully typed client that behaves like an ergonomic, type-safe version of `fetch()`.  
No manual type declarations. No generics. No SDK boilerplate.  
Just write API calls — the types are already there.

---

## ✨ Features

### **🔍 OpenAPI-driven type generation**
- Reads `openapi.json` and transforms every path, method, schema into typed API functions.
- Parameters, request bodies, headers, responses — all typed automatically.
- No need to write or maintain separate TypeScript definitions.

### **🪝 Fetch-compatible design**
Devup API feels like using `fetch`, but with superpowers:

- Path params automatically replaced  
- Query/body/header types enforced  
- Typed success & error responses  
- Optional runtime schema validation  
- Minimal abstraction over standard fetch

---

## 🚀 Quick Start

### **1. Initialize the client**

```ts
import { devupApi } from "devup-api";

// create api instance
const api = await devupApi("https://api.example.com");
```

### **2. Call endpoints — types are automatic**

```ts
const user = await api.get("/users/{id}", {
  params: { id: "123" },
  headers: {
    Authorization: "Bearer TOKEN"
  }
});

const user = await api.get("getUser", {
  params: { id: "123" },
  headers: {
    Authorization: "Bearer TOKEN"
  }
});
```

---

## 📦 Installation

```bash
npm install @devup-api/fetch

npm install @devup-api/next-plugin
npm install @devup-api/webpack-plugin
npm install @devup-api/rsbuild-plugin
npm install @devup-api/vite-plugin
```

---

## 📚 API Usage

### **GET Example**

```ts
await api.get("/posts", {
  query: { page: 1, limit: 20 }
});
```

### **POST Example**

```ts
await api.post("/posts", {
  body: {
    title: "Hello World",
    content: "This is a typed API request."
  }
});
```

### **Path Params Example**

```ts
await api.get("/posts/{id}", {
  params: { id: "777" }
});
```

---

## ⚙️ How It Works

1. Download `openapi.json`
2. Extract paths, methods, schemas, parameters, bodies
3. Generate TypeScript types automatically
4. Build a typed wrapper around `fetch()`
5. Expose methods based on the API structure

---

## 🎯 Why Devup API?

- No code generators
- No build steps
- No boilerplate
- Uses OpenAPI schema directly  
- Works in Next.js, Bun, Vite, rsbuild

---

## 🛠️ Roadmap

- [ ] Typescript interface generation
- [ ] Zod schema generation

---

## 📄 License

Apache 2.0
