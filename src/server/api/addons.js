module.exports = (api, app) => {
	const Addon = app.db.models.Addon;

	api.get("/addons", async (req, res) => {
		const addons = await Addon.findAll({ raw: true });
		addons.sort((a, b) => {
			return a.id - b.id;
		});

		res.json(addons);
	});
	api.post("/addons", async (req, res) => {
		const data = req.body;

		// I am pretty sure this isn't the way to do this stuff, but it works.
		if (Array.isArray(data)) {
			// Add or update entries
			for (const addon of data) {
				if (addon.id) {
					await Addon.findOne({ where: { id: addon.id } }).then(obj => {
						if (obj) obj.update(addon);
						return null;
					});
				} else {
					await Addon.create(addon).then(item => {
						addon.id = item.id;
					});
				}
			}

			// Cleanup missing IDs
			const addons = await Addon.findAll({ raw: true });
			for (const addon of addons) {
				if (!data.find(({ id }) => addon.id === id)) {
					await Addon.findOne({ where: { id: addon.id } }).then(obj => {
						if (obj) obj.destroy();
						return null;
					});
				}
			}

			res.json({
				success: true,
			});
		}
	});
};
