import type { Meta, StoryObj } from "@storybook/react";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["outlined", "filled"],
      description: "Input variant style",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
    fullWidth: {
      control: "boolean",
      description: "Full width input",
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel"],
      description: "Input type",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Email Address",
    placeholder: "john@example.com",
    type: "email",
  },
};

export const WithError: Story = {
  args: {
    label: "Email Address",
    placeholder: "john@example.com",
    type: "email",
    error: "Please enter a valid email address",
    value: "invalid-email",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Username",
    placeholder: "johndoe",
    helperText: "Choose a unique username",
  },
};

export const Required: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    required: true,
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: "Email",
    placeholder: "john@example.com",
    leftIcon: <FaEnvelope />,
  },
};

export const WithRightIcon: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    rightIcon: <FaEye />,
  },
};

export const WithBothIcons: Story = {
  args: {
    label: "Username",
    placeholder: "johndoe",
    leftIcon: <FaUser />,
    rightIcon: <FaEye />,
  },
};

export const FilledVariant: Story = {
  args: {
    variant: "filled",
    label: "Email Address",
    placeholder: "john@example.com",
    leftIcon: <FaEnvelope />,
  },
};

export const Disabled: Story = {
  args: {
    label: "Email Address",
    placeholder: "john@example.com",
    disabled: true,
    value: "disabled@example.com",
  },
};

export const FullWidth: Story = {
  args: {
    label: "Full Name",
    placeholder: "John Doe",
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

export const EmailInput: Story = {
  args: {
    label: "Email",
    type: "email",
    placeholder: "john@example.com",
    leftIcon: <FaEnvelope />,
    fullWidth: true,
  },
};

export const PasswordInput: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    leftIcon: <FaLock />,
    rightIcon: <FaEyeSlash />,
    fullWidth: true,
  },
};
