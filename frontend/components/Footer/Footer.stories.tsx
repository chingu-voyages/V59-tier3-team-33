import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from "./Footer";

const meta: Meta<typeof Footer> = {
  title: "Components/Footer",
  component: Footer,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {};

export const Minimal: Story = {
  args: {
    sections: [
      {
        title: "Quick Links",
        links: [
          { label: "Home", href: "/" },
          { label: "My Trips", href: "/trips" },
        ],
      },
    ],
  },
};
