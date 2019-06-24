module.exports = (api, app) => {
    const Addon = app.db.models.Addon;

    api.get("/addons", async (req, res) => {
        let addons = await Addon.findAll({ raw: true });
        addons.sort((a, b) => {
            return a.id - b.id;
        });

        res.json(addons);
    });
    api.post("/addons", async (req, res) => {
        let data = req.body;

        // I am pretty sure this isn't the way to do this stuff, but it works.
        if (Array.isArray(data)) {
            // Add or update entries
            for (let [val, key] of data.entries()) {
                val.id = key + 1;
                await Addon.findOrCreate({ where: { id: val.id } })
                    .spread((obj, created) => {
                        obj.update(val);
                        return null;
                    })
                    .catch(console.error);
            }

            // Cleanup missing IDs
            let addons = await Addon.findAll({ raw: true });
            for (let [val, key] of addons.entries()) {
                val.id--;
                if (!data[val.id]) {
                    await Addon.findOne({ where: { id: val.id } })
                        .then(obj => {
                            if (obj) obj.destroy();
                            return null;
                        })
                        .catch(console.error);
                }
            }

            res.json({
                success: true,
            });
        }
    });
};
