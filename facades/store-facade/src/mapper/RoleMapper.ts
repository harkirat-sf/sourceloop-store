import { Permission } from '../enums/Permission';
import { UserRole } from '../enums/Role';

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    Permission.GET_STORE, Permission.CREATE_ORDER, Permission.CREATE_PRODUCT, Permission.GET_PRODUCTS, Permission.GET_USER_CART
  ],

  [UserRole.ADMIN]: [
    Permission.GET_PRODUCTS, Permission.CREATE_ORDER, Permission.GET_USER_CART
  ],

  [UserRole.SUBSCRIBER]: [
    Permission.GET_USER_CART
  ],
};