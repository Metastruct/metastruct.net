# metastruct.net

![](https://tenrys.pw/ShareX/2019/Jan/3AkJ.png)

> New website for the Meta Construct community

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn run dev

# build for production and launch server
$ yarn run build
$ yarn start

# generate static project
$ yarn run generate
```

## Config

`config.json` at the repo root (gitignored). Besides `secret`, `postgres`, `steam`, `saml` and `gameservers`, the add-ons page needs:

```json
"metaconcord": { "url": "https://metaconcord.metastruct.net" }
```

`/api/v1/addons` and `/api/v1/servers` proxy `<url>/addons` and `<url>/servers` from node-metaconcord. `gameservers` is still needed for the `/join/<name>` redirects.

For detailed explanation on how things work, checkout [Nuxt.js docs](https://nuxtjs.org).
