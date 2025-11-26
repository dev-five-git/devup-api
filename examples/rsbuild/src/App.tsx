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
      .get('getUserById', {
        params: { id: 1 },
      })
      .then((res) => {
        console.log(res)
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
      <h1>Rsbuild Example - devup-api</h1>
      <p>This example uses Rsbuild with devup-api plugin.</p>
      <div className="info-box">
        <h2>Environment Variables:</h2>
        <pre>{urlMap ? JSON.stringify(urlMap, null, 2) : 'Not available'}</pre>
      </div>
    </div>
  )
}

export default App
