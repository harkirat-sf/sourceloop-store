export declare enum Permission {
    GET_STORE = "GET_STORE",
    CREATE_ORDER = "CREATE_ORDER",
    CREATE_PRODUCT = "CREATE_PRODUCT",
    GET_PRODUCTS = "GET_PRODUCTS",
    GET_USER_CART = "GET_USER_CART"
}
export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    SUBSCRIBER = "SUBSCRIBER"
}
export declare const RolePermissions: Record<UserRole, Permission[]>;
