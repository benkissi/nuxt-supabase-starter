export function useAppMenu() {
  const defaultMenus = [
    {
      id: "overview",
      label: "Overview",
      to: "/dashboard",
      icon: "heroicons:home",
      tooltip: {
        text: "Overview",
        shortcuts: ["G", "H"],
      },
    },
    {
      id: "members",
      label: "Members",
      to: "/dashboard/members",
      icon: "heroicons:users",
      tooltip: {
        text: "Members",
        shortcuts: ["G", "M"],
      },
    },
  ];
  return {
    defaultMenus,
  };
}
