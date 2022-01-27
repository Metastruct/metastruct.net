module.exports = (api, app) => {
  const HistoryEvent = app.db.sequelize.models.HistoryEvent;

  api.get("/history", async (req, res) => {
    const events = await HistoryEvent.findAll({ raw: true });
    events.sort((a, b) => {
      return a.id - b.id;
    });

    res.json(events);
  });

  const methods = [
    {
      method: "post",
      async callback(data) {
        let hasCreated = false;
        const entries = [];
        for (const val of data) {
          const [result, created] = await HistoryEvent.findOrCreate({ where: val });
          const entry = result.get({ plain: true });
          if (created) {
            hasCreated = true;
            entry.justCreated = true;
          }
          entries.push(entry);
        }

        return { success: hasCreated, entries };
      },
    },
    {
      method: "patch",
      async callback(data) {
        let found = false;
        const entries = [];
        for (const val of data) {
          let entry = await HistoryEvent.findOne({
            where: { id: val.id },
          });
          if (entry) {
            found = true;
            await entry.update(val);
            entry = entry.get({ plain: true });
            entries.push(entry);
          }
        }

        return { success: found, entries };
      },
    },
    {
      method: "delete",
      async callback(data) {
        let found = false;
        for (const val of data) {
          const entry = await HistoryEvent.findOne({
            where: { id: val.id },
          });
          if (entry) {
            found = true;
            await entry.destroy();
          }
        }

        return { success: found };
      },
    },
  ];

  for (const method of methods) {
    api[method.method]("/history", async (req, res) => {
      const data = req.body;

      if (Array.isArray(data)) {
        const { success, entries } = await method.callback(data);

        return res.json({
          success,
          entries,
        });
      }

      res.json({
        success: false,
      });
    });
  }
};
