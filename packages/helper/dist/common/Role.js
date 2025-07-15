"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissions = exports.UserRole = exports.Permission = void 0;
var Permission;
(function (Permission) {
    Permission["GET_STORE"] = "GET_STORE";
    Permission["CREATE_ORDER"] = "CREATE_ORDER";
    Permission["CREATE_PRODUCT"] = "CREATE_PRODUCT";
    Permission["GET_PRODUCTS"] = "GET_PRODUCTS";
    Permission["GET_USER_CART"] = "GET_USER_CART";
})(Permission || (exports.Permission = Permission = {}));
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUBSCRIBER"] = "SUBSCRIBER";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.RolePermissions = {
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
