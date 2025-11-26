import { createApi } from '@devup-api/fetch'
import { useEffect } from 'react'

const api = createApi('https://api.example.com')

function App() {
  const urlMap = process.env.DEVUP_API_URL_MAP
    ? JSON.parse(process.env.DEVUP_API_URL_MAP)
    : null

  useEffect(() => {
    api.get('getUsers', {}).then((res) => {
      console.log(res)
    })

    api
      .get('/users/{userId}/posts', {
        params: { userId: 1 },
        // query: { postId: 1 },
      })
      .then((res) => {
        console.log(res.data?.[0]?.createdAt)
      })

    api
      .get('/users/{id}', {
        params: { id: 1 },
        // query: { postId: 1 },
      })
      .then((res) => {
        console.log(res.data?.createdAt, res.error?.message)
      })

    api
      .get('getUserById', {
        params: { id: 1 },
        // query: { postId: 1 },
      })
      .then((res) => {
        console.log(res.data?.createdAt, res.error?.message)
      })

    api
      .post('createUser', {
        body: {
          name: 'John Doe',
          email: 'foo@bar.com',
        },
      })
      .then((res) => {
        console.log(res)
      })
  }, [])

  return (
    <div className="app">
      <h1>Vite Example - devup-api</h1>
      <p>This example uses Vite with devup-api plugin.</p>
      <div className="info-box">
        <h2>Environment Variables:</h2>
        <pre>{urlMap ? JSON.stringify(urlMap, null, 2) : 'Not available'}</pre>
      </div>
    </div>
  )
}

export default App
