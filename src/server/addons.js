module.exports = app => {
    const addon = app.db.models.addon

    app.get("/addons.json", async (req, res) => {
        let addons = await addon.findAll({ raw: true })
        addons.sort((a, b) => {
            return a.id > b.id ? 1 : -1
        })

        res.json(addons)
    })
    app.post("/addons.json", async (req, res) => {
        if (req.user && req.user.isAdmin) {
            let data = req.body

            // I am pretty sure this isn't the way to do this shit, but it works.
            if (Array.isArray(data)) {
                // Add or update entries
                data.forEach(async (val, key) => {
                    val.id = key + 1
                    await addon.findOrCreate({ where: { id: val.id } })
                        .spread((obj, created) => {
                            obj.update(val)
                        })
                })

                res.json({
                    success: true
                })

                // Cleanup missing IDs
                let addons = await addon.findAll({ raw: true })
                addons.forEach(async val => {
                    val.id--
                    if (!data[val.id]) {
                        await addon.findOne({ where: { id: val.id } })
                            .then(obj => {
                                if (obj) obj.destroy()
                            })
                    }
                })
                return
            }
        }

        res.status(401)
        res.json({
            success: false,
        })
    })
}
