export interface NavigationLink {
  label: string;
  href: string;
}

export interface NavigationProps {
  links?: NavigationLink[];
  sticky?: boolean;
  className?: string;
}
