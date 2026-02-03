export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export type SocialIcon = "twitter" | "linkedin" | "github";

export interface SocialLink {
  name: string;
  href: string;
  icon: SocialIcon;
}

export interface FooterProps {
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  showContributor?: boolean;
  className?: string;
}
