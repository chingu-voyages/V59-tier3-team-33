import type { Meta, StoryObj } from "@storybook/react";
import { Logo } from "./Logo";

const meta: Meta<typeof Logo> = {
  title: "Components/Logo",
  component: Logo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    large: {
      control: "boolean",
      description: "Large logo size",
    },
    logoOnly: {
      control: "boolean",
      description: "Show only logo without text",
    },
    href: {
      control: "text",
      description: "Link destination",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  args: {},
};

export const Large: Story = {
  args: {
    large: true,
  },
};

export const LogoOnly: Story = {
  args: {
    logoOnly: true,
  },
};

export const LargeLogoOnly: Story = {
  args: {
    large: true,
    logoOnly: true,
  },
};
