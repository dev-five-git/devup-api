/**
 * OPENAPI-TYPESCRIPT
 * @param request
 * @param response
 * @param parseAs
 * @returns
 */
export async function convertResponse(
  request: Request,
  response: Response,
  parseAs: 'stream' | 'json' | 'text' = 'json',
): Promise<{
  data?: unknown | undefined
  error?: unknown | undefined
  response: Response
}> {
  if (
    response.status === 204 ||
    request.method === 'HEAD' ||
    response.headers.get('Content-Length') === '0'
  ) {
    return response.ok
      ? { data: undefined, response }
      : { error: undefined, response }
  }

  // parse response (falling back to .text() when necessary)
  if (response.ok) {
    // if "stream", skip parsing entirely
    if (parseAs === 'stream') {
      return { data: response.body, response }
    }
    return { data: await response[parseAs](), response }
  }

  // handle errors
  let error = await response.text()
  try {
    error = JSON.parse(error) // attempt to parse as JSON
  } catch {
    // noop
  }
  return { error, response }
}
