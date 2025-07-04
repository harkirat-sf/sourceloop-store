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
        console.log("propertyKey", propertyKey);
        (0, repository_1.property)(Object.assign({}, params))(target, propertyKey);
        const privateKey = `__${propertyKey}`;
        Object.defineProperty(target, propertyKey, {
            get: function () {
                const value = this[privateKey];
                return value ? (0, moment_1.default)(value).format(format) : value;
            },
            set: function (value) {
                this[privateKey] = new Date(value);
            },
            enumerable: true,
            configurable: true,
        });
    };
}
