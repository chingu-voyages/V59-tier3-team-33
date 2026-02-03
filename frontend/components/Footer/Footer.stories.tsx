import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from "./Footer";

const meta: Meta<typeof Footer> = {
  title: "Components/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    showAppDownload: {
      control: "boolean",
      description: "Show app download section instead of social links",
    },
    copyrightText: {
      control: "text",
      description: "Copyright text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  args: {},
};

export const WithAppDownload: Story = {
  args: {
    showAppDownload: true,
  },
};

export const CustomSections: Story = {
  args: {
    sections: [
      {
        title: "Product",
        links: [
          { label: "Features", href: "/features" },
          { label: "Pricing", href: "/pricing" },
          { label: "Case Studies", href: "/case-studies" },
          { label: "Reviews", href: "/reviews" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Careers", href: "/careers" },
          { label: "Blog", href: "/blog" },
          { label: "Press", href: "/press" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Documentation", href: "/docs" },
          { label: "API", href: "/api" },
          { label: "Guides", href: "/guides" },
          { label: "Support", href: "/support" },
        ],
      },
    ],
  },
};

export const MinimalFooter: Story = {
  args: {
    sections: [
      {
        title: "Quick Links",
        links: [
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
        ],
      },
    ],
    socialLinks: [
      { name: "Twitter", href: "https://twitter.com", icon: "twitter" },
      { name: "GitHub", href: "https://github.com", icon: "github" },
    ],
  },
};

export const AllSocialLinks: Story = {
  args: {
    socialLinks: [
      { name: "Facebook", href: "https://facebook.com", icon: "facebook" },
      { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
      { name: "Twitter", href: "https://twitter.com", icon: "twitter" },
      { name: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
      { name: "GitHub", href: "https://github.com", icon: "github" },
      { name: "YouTube", href: "https://youtube.com", icon: "youtube" },
    ],
  },
};
