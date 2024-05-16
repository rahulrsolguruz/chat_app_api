export interface Permission {
  section: string;
  section_permission: string[];
}

export interface RoleRequestBody {
  role_name: string;
  description: string;
  permissions: Permission[];
}
