"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormattedDate = FormattedDate;
const repository_1 = require("@loopback/repository");
const moment_1 = __importDefault(require("moment"));
function FormattedDate(format = 'YYYY-MM-DD HH:mm:ss', params) {
    return function (target, propertyKey) {
        const internalKey = `__${propertyKey}`;
        // Define the actual persisted property with @property
        (0, repository_1.property)(params)(target, internalKey);
        // Define a virtual property for access with formatting
        Object.defineProperty(target, propertyKey, {
            get: function () {
                const value = this[internalKey];
                return value ? (0, moment_1.default)(value).format(format) : value;
            },
            set: function (value) {
                this[internalKey] = value ? new Date(value) : value;
            },
            enumerable: true,
            configurable: true,
        });
    };
}
