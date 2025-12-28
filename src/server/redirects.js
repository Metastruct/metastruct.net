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

const fallbackIPs = {
  eu1: "195.154.166.219:27015",
  eu2: "164.92.180.157:27015",
  eu3: "116.202.33.7:27015",
  us1: "66.42.103.116:27015",
};

async function resolveHostname(hostname) {
  try {
    return (await dns.lookup(hostname)).address;
  } catch (err) {
    console.error("failed to resolve hostname", err);
  }
}

module.exports = async app => {
  for (const [name, url] of Object.entries(redirects)) {
    console.log("Added redirect for " + name + " at " + url);
    app.get(`/${name}`, (req, res) => {
      res.redirect(url);
    });
  }

  for (const [name, data] of Object.entries(app.config.gameservers)) {
    const hostname = data.address;
    const ip = (await resolveHostname(hostname)) ?? fallbackIPs[name];
    if (!ip) continue;

    app.get(`/join/${name}/:pwd?`, (req, res) => {
      const pwd = (req.params.pwd || "metawebsite").replace(/[^a-zA-Z*0-9:+-\s]+/g, "");
      res.redirect(`steam://connect/${ip}/${pwd}`);
    });
    console.log("Added join URL for " + name + " at " + hostname + " with ip " + ip);
  }
};
