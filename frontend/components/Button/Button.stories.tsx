import type { Meta, StoryObj } from "@storybook/react";
import { FaHeart, FaMap } from "react-icons/fa";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: "Primary Button" },
};

export const Secondary: Story = {
  args: { children: "Secondary Button", variant: "secondary" },
};

export const Clear: Story = {
  args: { children: "Clear Button", variant: "clear" },
};

export const WithIcon: Story = {
  args: {
    children: "Location",
    icon: <FaMap />,
  },
};

export const IconOnly: Story = {
  args: {
    icon: <FaHeart />,
    iconOnly: true,
    round: true,
  },
};

export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
};
