module.exports = app => {
    const addon = app.db.models.addon

    app.get("/addons.json", async (req, res) => {
        let addons = await addon.findAll({ raw: true })

        res.json(addons)
    })
    app.post("/addons.json", async (req, res) => {
        let data = req.body

        console.log(data)

        res.json({
            success: true
        })
    })
}
