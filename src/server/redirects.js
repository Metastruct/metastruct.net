const dns = require("dns").promises;

const redirects = {
  loadingscreen: "https://loadingscreen.metastruct.net/",
  gallery: "https://loadingscreen.metastruct.net/",
  gitlab: "https://gitlab.com/metastruct",
  github: "https://github.com/metastruct",
  msdnaa: "https://www3.metastruct.net/msdnaa",
  rocket: "https://www3.metastruct.net/rocket2",
  rocket2: "https://www3.metastruct.net/rocket2",
  discord: "https://discord.gg/CHuxFSd",
  re: "https://g2cf.metastruct.net/reauth",
};

async function resolveHostname(hostname) {
  try {
    return (await dns.lookup(hostname)).address
  }
  catch (err) {
    console.error("failed to resolve hostname", err)
  }
}

module.exports = app => {

  for (const [name, url] of Object.entries(redirects)) {
    console.log("Added redirect for " + name + " at " + url);
    app.get(`/${name}`, (req, res) => {
      res.redirect(url);
    });
  }
  // hacky but should work
  (async () => {
    for (const [name, data] of Object.entries(app.config.gameservers)) {
      const hostname = data.address;
      const ip = await resolveHostname(hostname);
      if (!ip) continue;
      app.get(`/join/${name}/:pwd?`, (req, res) => {
        const pwd = (req.params.pwd || "metawebsite").replace(/[^a-zA-Z*0-9:+-\s]+/g, "");
        res.redirect(`steam://connect/${ip}/${pwd}`);
      });
      console.log("Added join URL for " + name + " at " + hostname + " with ip " + ip);
    }
  })
};
