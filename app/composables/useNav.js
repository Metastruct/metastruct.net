// Single source for the navigation links. The desktop bar in the layout and the
// mobile drawer both render from this, so a new link is added in one place.
// Items carry either `to` (internal route) or `href` (external), never both.
export function useNav() {
  const { user } = useUser();
  const { $mcUrl } = useNuxtApp();

  // sections without a label render their items inline, labelled ones become a
  // dropdown on desktop and a collapsible group in the drawer
  const start = computed(() => [
    {
      items: [
        {
          label: "Forums",
          icon: "forum",
          href: "https://steamcommunity.com/groups/metastruct/discussions",
        },
        { label: "GitHub", icon: "github-circle", href: "https://github.com/metastruct" },
        { label: "Merchandise", icon: "shopping", href: "https://merch.metastruct.net" },
      ],
    },
    {
      label: "Others",
      icon: "dots-horizontal",
      items: [
        { label: "Chatsounds", href: "https://chatsounds.metastruct.net" },
        { label: "Gmod Dumps", href: "https://dumps.metastruct.net" },
        { label: "Gmod Wiki", href: "https://wiki.metastruct.net" },
      ],
    },
  ]);

  const end = computed(() => {
    if (!user.value.isAdmin) return [];

    const items = [
      { label: "GitLab", icon: "gitlab", href: "https://gitlab.com/metastruct" },
      { label: "Rocket", icon: "rocket", to: "/rocket" },
      { label: "Bans", icon: "minus-circle", to: "/bans" },
    ];

    if ((user.value.teams || []).includes("administrators")) {
      items.push({ label: "Metaconcord", icon: "robot", href: $mcUrl, external: true });
    }

    return [{ label: "Admin", icon: "key", items }];
  });

  return { start, end };
}
