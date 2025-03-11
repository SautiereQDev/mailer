"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteError = void 0;
/******************************************************************************
                              Classes
******************************************************************************/
/**
 * Error with status code and message.
 */
class RouteError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.RouteError = RouteError;
