module.exports = (api, app) => {
    const HistoryEvent = app.db.models.HistoryEvent

    api.get("/history", async (req, res) => {
        let events = await HistoryEvent.findAll({ raw: true })
        events.sort((a, b) => {
            return a.id - b.id
        })

        res.json(events)
    })
    api.post("/history", async (req, res) => {
        if (req.user && req.user.isAdmin) {
            let data = req.body

            console.log(data)

            res.json({
                success: true
            })
            return
        }

        res.status(401)
        res.json({
            success: false,
        })
    })
}
