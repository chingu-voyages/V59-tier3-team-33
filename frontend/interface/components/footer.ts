
export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  name: string;
  href: string;
  icon:
    | "twitter"
    | "linkedin"
    | "github"
}

export interface FooterProps {
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  showContributor?: boolean;
  className?: string;
}
