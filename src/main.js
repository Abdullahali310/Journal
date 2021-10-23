const express = require('express')
const app = express()
const port = 3000
const journalistRouter = require('./routers/journalist')
const newsRouter = require('./routers/news')

require('./db/mongoose')

app.use(express.json())

app.use(journalistRouter)
app.use(newsRouter)

app.listen(port,()=>{
    console.log(`Server is running ... on localhost:${port}`)
})