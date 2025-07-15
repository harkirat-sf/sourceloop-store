export enum Permission {
    GET_STORE = 'GET_STORE',
    CREATE_ORDER = 'CREATE_ORDER',
    CREATE_PRODUCT = 'CREATE_PRODUCT',
    GET_PRODUCTS = 'GET_PRODUCTS',
    GET_USER_CART = 'GET_USER_CART',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SUBSCRIBER = 'SUBSCRIBER',
}


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