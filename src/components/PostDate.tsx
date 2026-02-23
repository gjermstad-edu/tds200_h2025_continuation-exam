import React from "react";
import { Text } from "react-native";

type DateTimeVariant = "full" | "date" | "time";

type PostDateProps = {
  value?: Date | null;
  variant?: DateTimeVariant;
};

const pad2digits = (value: number) => String(value).padStart(2, "0");

export const formatDateOnly = (value: Date) =>
  `${pad2digits(value.getDate())}.${pad2digits(value.getMonth() + 1)}.${value.getFullYear()}`;

export const formatTimeOnly = (value: Date) =>
  `${pad2digits(value.getHours())}:${pad2digits(value.getMinutes())}`;

export const formatDateTimeFull = (value: Date) =>
  `${formatDateOnly(value)} kl. ${formatTimeOnly(value)}`;

export default function PostDate({ value, variant = "full" }: PostDateProps) {
  if (!value) return <Text>—</Text>;

  const formatterByVariant: Record<DateTimeVariant, (date: Date) => string> = {
    full: formatDateTimeFull,
    date: formatDateOnly,
    time: formatTimeOnly,
  };

  return formatterByVariant[variant](value);
}
