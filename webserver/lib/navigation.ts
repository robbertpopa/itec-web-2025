export interface NavLink {
  name: string;
  href: string;
}

export const mainNavLinks: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
];
