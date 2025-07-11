"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeFetch = safeFetch;
async function safeFetch(fn) {
    try {
        return await fn();
    }
    catch (_a) {
        return null;
    }
}
