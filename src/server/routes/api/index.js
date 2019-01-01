module.exports = app => {
    const express = require("express")

    let api = express.Router()
    api.app = app

    api.get("/", (req, res) => {
        res.send("Hello World!")
    })

    return api
}
