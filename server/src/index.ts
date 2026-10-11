import express from 'express'

const app = express()
const PORT = Number(process.env.PORT) || 3000

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Sequence server is running!',
  })
})

app.listen(PORT, () => {
  console.log(`Sequence server running at http://localhost:${PORT}`)
})
