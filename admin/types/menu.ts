import type { ReactNode } from "react";

export type MenuItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  children?: MenuItem[];
};
