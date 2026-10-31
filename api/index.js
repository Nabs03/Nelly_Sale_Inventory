import app from "../server.js"

export default function handler(req, res) {
  const requestUrl = new URL(req.url, "http://localhost")
  const requestPath = requestUrl.searchParams.get("vercelPath")

  if (requestPath !== null) {
    requestUrl.searchParams.delete("vercelPath")
    req.url = `/api/${requestPath}${requestUrl.search}`
  }

  return app(req, res)
}
