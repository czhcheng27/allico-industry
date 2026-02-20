export type PermissionAction = "read" | "write";

export type Permission = {
  route: string;
  actions: PermissionAction[];
};

export type UserInfo = {
  username: string;
  role: string;
};
