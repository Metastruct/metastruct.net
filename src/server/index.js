
const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")

const consola = require("consola")
const { Nuxt, Builder } = require("nuxt")

const app = express()

const host = process.env.HOST || "127.0.0.1"
const port = process.env.PORT || (process.env.NODE_ENV === "production" ? 3000 : 80)

app.set("port", port)

app.use(session({ // Look into options
    name: "metastruct.net",
    resave: true,
    saveUninitialized: true,
    secret: "to_configure",
    proxy: true,
    cookie: { secure: "auto" }
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Import app options
app.config = require("../../config.json")

// Import and set Nuxt.js options
let nuxtConfig = require("../../nuxt.config.js")
nuxtConfig.dev = !(process.env.NODE_ENV === "production")

async function start() {
    // Init our stuff
    app.db = await require("./db.js")(app)
    require("./auth.js")(app)
    app.use("/api/v1", require("./api")(app))
    require("./redirects.js")(app)

    // Init Nuxt.js
    const nuxt = new Nuxt(nuxtConfig)

    // Build only in dev mode
    if (nuxtConfig.dev) {
        const builder = new Builder(nuxt)
        await builder.build()
    }

    // Give nuxt middleware to express
    app.use(nuxt.render)

    // Listen the server
    app.listen(port, host)
    consola.ready({
        message: `Server listening on http://${host}:${port}`,
        badge: true
    })

    console.log("\007")

    consola.ready({
        message: `REPL started`,
        badge: true
    })
    let repl = require("repl").start("> ")
    repl.context.app = app
}
start()
