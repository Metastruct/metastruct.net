const request = require("request-promise-native");
const dns = require('node:dns').promises;

const dnsCache = new Map();
async function resolveOnce(hostname) {
  if (dnsCache.has(hostname)) {
    return dnsCache.get(hostname);
  }

  try {
    const addresses = await dns.resolve4(hostname);
    const primaryIp = addresses[0];
    dnsCache.set(hostname, primaryIp);
    return primaryIp;
  } catch (err) {
    console.error(`Failed to resolve ${hostname}:`, err.message);
    return null;
  }
}

module.exports = (api, app) => {
  const gameservers = app.config.gameservers;

  // https://g2cf.metastruct.net/app/playerlist?server=# gives a better result though
  api.get("/servers", async (req, res) => {
	  
    res.set("Cache-Control", "public, max-age=10, stale-while-revalidate=120, stale-if-error=3600");
    const info = {};

    for (const [name, data] of Object.entries(gameservers)) {
      if (data.serverid) {
        try {
          const _info = JSON.parse(
            await request(`https://g2cf.metastruct.net/app/playerlist?server=${data.serverid}`)
          );
          delete _info.players;
          _info.serverinfo.dns = data.address;
          _info.serverinfo.address = await resolveOnce(data.address) || data.address;
          _info.serverinfo.port = data.port;
          info[name] = _info;
        } catch (e) {}
      }
    }

    res.json(info);
  });
};
