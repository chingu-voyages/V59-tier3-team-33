import type { Meta, StoryObj } from "@storybook/react";
import { Navigation } from "./Navigation";

const meta: Meta<typeof Navigation> = {
  title: "Components/Navigation",
  component: Navigation,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    sticky: {
      control: "boolean",
      description: "Sticky navigation bar",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Navigation>;

export const Default: Story = {
  args: {},
};

export const CustomLinks: Story = {
  args: {
    links: [
      { label: "Destinations", href: "/destinations" },
      { label: "Itineraries", href: "/itineraries" },
      { label: "Places", href: "/places" },
      { label: "Contact", href: "/contact" },
    ],
  },
};

export const NonSticky: Story = {
  args: {
    sticky: false,
  },
};
