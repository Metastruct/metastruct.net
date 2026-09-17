export const SHORT_LINKS = {
  "/loadingscreen": "https://loadingscreen.metastruct.net/",
  "/gallery": "https://loadingscreen.metastruct.net/",
  "/gitlab": "https://gitlab.com/metastruct",
  "/github": "https://github.com/metastruct",
  "/msdnaa": "https://www3.metastruct.net/msdnaa",
  "/discord": "https://discord.gg/CHuxFSd",
  "/re": "https://g2cf.metastruct.net/reauth",
};

/** Target for a request path, ignoring case and a trailing slash. */
export function resolveShortLink(path) {
  const trimmed = String(path ?? "").replace(/\/+$/, "");
  return SHORT_LINKS[trimmed.toLowerCase()] ?? null;
}
