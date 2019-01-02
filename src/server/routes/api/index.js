const express = require("express")

module.exports = app => {
    let api = express.Router()
    api.app = app

    api.get("/", (req, res) => {
        res.send("Hello World!")
    })

    require("./servers.js")(api)

    return api
}
