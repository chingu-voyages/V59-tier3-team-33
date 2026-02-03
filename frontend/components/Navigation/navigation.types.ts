export interface NavigationLink {
  label: string;
  href: string;
}

export interface NavigationProps {
  links?: NavigationLink[];
  showUser?: boolean;
  userName?: string;
  sticky?: boolean;
  className?: string;
  onUserClick?: () => void;
}
