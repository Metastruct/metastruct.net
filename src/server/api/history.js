module.exports = (api, app) => {
    const HistoryEvent = app.db.models.HistoryEvent

    api.get("/history", async (req, res) => {
        let events = await HistoryEvent.findAll({ raw: true })
        events.sort((a, b) => {
            return a.id - b.id
        })

        res.json(events)
    })

    let methods = [
        {
            method: "post",
            async callback(data) {
                let hasCreated = false
                let entries = []
                for (let val of data) {
                    await HistoryEvent.findOrCreate({ where: val })
                        .spread((entry, created) => {
                            entry = entry.get({ plain: true })
                            if (created) {
                                hasCreated = true
                                entry.justCreated = true
                            }
                            console.log(entry, entries)
                            entries.push(entry)
                        })
                        .catch(console.error)
                }

                return { success: hasCreated, entries }
            }
        },
        {
            method: "patch",
            async callback(data) {
                let found = false
                let entries = []
                for (let val of data) {
                    await HistoryEvent.findOne({ where: { id: val.id } })
                        .then(entry => {
                            found = true
                            entry.update(val)
                            entry = entry.get({ plain: true })
                            entries.push(entry)
                        })
                        .catch(console.error)
                }

                return { success: found, entries }
            }
        },
        {
            method: "delete",
            async callback(data) {
                let found = false
                for (let val of data) {
                    await HistoryEvent.findOne({ where: { id: val.id } })
                        .then(entry => {
                            found = true
                            entry.destroy()
                        })
                        .catch(console.error)
                }

                return { success: found }
            }
        }
    ]

    for (let method of methods) {
        api[method.method]("/history", async (req, res) => {
            let data = req.body

            console.log(data)

            if (Array.isArray(data)) {
                let { success, entries } = await method.callback(data)

                res.json({
                    success,
                    entries
                })
                return
            }

            res.json({
                success: false
            })
        })
    }
}