import type { Meta, StoryObj } from "@storybook/react";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "clear"],
      description: "Button variant",
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "Button size",
    },
    round: {
      control: "boolean",
      description: "Round button style",
    },
    iconOnly: {
      control: "boolean",
      description: "Icon only button",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Primary Button",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary Button",
    variant: "secondary",
  },
};

export const Clear: Story = {
  args: {
    children: "Clear Button",
    variant: "clear",
  },
};

export const Small: Story = {
  args: {
    children: "Small Button",
    size: "small",
  },
};

export const Large: Story = {
  args: {
    children: "Large Button",
    size: "large",
  },
};

export const Round: Story = {
  args: {
    children: "Round Button",
    round: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: "Add to Cart",
    icon: <FaShoppingCart />,
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
  args: {
    children: "Disabled Button",
    disabled: true,
  },
};
