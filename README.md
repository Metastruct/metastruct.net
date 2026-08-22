# metastruct.net

![](https://tenrys.pw/ShareX/2019/Jan/3AkJ.png)

> Website for the Meta Construct community

Static Nuxt 2 site. Everything dynamic (server list, add-ons, GitHub login, history editing, `/join` and short links) is served by [node-metaconcord](https://github.com/Metastruct/node-metaconcord). The history timeline is read from `history.json` in the [Metastruct/history](https://github.com/Metastruct/history) repo.

## Build Setup

```bash
# install dependencies
$ yarn install

# dev server at localhost:20000, proxies /mc/* to metaconcord so login cookies work locally
$ yarn dev

# generate the static site into dist/
$ yarn build
```

## Config

Environment variables, read at build time (see `.env.example`):

- `METACONCORD_URL`: metaconcord base URL, default `https://metaconcord.metastruct.net`
- `HISTORY_URL`: raw URL of `history.json`, default the `Metastruct/history` master branch

The Dockerfile builds the site and serves `dist/` with nginx on port 20080.
