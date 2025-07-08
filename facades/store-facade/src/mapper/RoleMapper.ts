import { Permission } from '../enums/Permission';
import { UserRole } from '../enums/Role';

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    Permission.GET_STORE, Permission.CREATE_ORDER, Permission.CREATE_PRODUCT, Permission.GET_ORDER, Permission.GET_PRODUCT
  ],

  [UserRole.ADMIN]: [
    Permission.GET_ORDER, Permission.GET_PRODUCT, Permission.CREATE_PRODUCT,
  ],

  [UserRole.SUBSCRIBER]: [
    Permission.GET_USER
  ],
};