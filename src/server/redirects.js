const redirects = {
    gallery: "https://loadingscreen.metastruct.net/",
    msdnaa: "https://www3.metastruct.net/msdnaa",
    rocket: "https://www3.metastruct.net/rocket",
    rocket2: "https://www3.metastruct.net/rocket2",
    discord: "https://discord.gg/CHuxFSd",
    webchat: "https://www3.metastruct.net/webchat",
};
const joinURLs = {
    // This is separate from config.gameservers, apparently
    eu1: "g1.metastruct.net:27015",
    eu2: "g2.metastruct.net:27018",
    hl2coop: "g2.metastruct.net:27016",
    hl2dm: "g2.metastruct.net:27015",
};

module.exports = app => {
    for (const [name, url] of Object.entries(redirects)) {
        console.log("Added redirect for " + name + " at " + url);
        app.get(`/${name}`, (req, res) => {
            res.redirect(url);
        });
    }
    for (const [id, hostname] of Object.entries(joinURLs)) {
        console.log("Added join URL for " + id + " at " + hostname);
        app.get(`/join/${id}/:pwd?`, (req, res) => {
            let pwd = (req.params.pwd || "metawebsite").replace(/[^a-zA-Z*0-9:+-\s]+/g, "");
            res.redirect(`steam://connect/${hostname}/${pwd}`);
        });
    }
};
