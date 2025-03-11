"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const routes_1 = __importDefault(require("@src/routes"));
const ENV_1 = __importStar(require("@src/common/ENV"));
const HttpStatusCodes_1 = __importDefault(require("@src/common/HttpStatusCodes"));
const route_errors_1 = require("@src/common/route-errors");
/******************************************************************************
                                Setup
******************************************************************************/
const app = (0, express_1.default)();
// **** Middleware **** //
// Basic middleware
app.set('trust proxy', 1);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Show routes called in console during development
if (ENV_1.default.NodeEnv === ENV_1.NodeEnvs.Dev) {
    app.use((0, morgan_1.default)('dev'));
}
// Security
if (ENV_1.default.NodeEnv === ENV_1.NodeEnvs.Production) {
    // eslint-disable-next-line n/no-process-env
    if (!process.env.DISABLE_HELMET) {
        app.use((0, helmet_1.default)());
    }
}
// Add APIs, must be after middleware
app.use('/mailer', routes_1.default);
// Add error handler
app.use((err, _, res, next) => {
    let status = HttpStatusCodes_1.default.BAD_REQUEST;
    if (err instanceof route_errors_1.RouteError) {
        status = err.status;
        res.status(status).json({ error: err.message });
    }
    return next(err);
});
// **** FrontEnd Content **** //
// Set views directory (html)
const viewsDir = path_1.default.join(__dirname, 'views');
app.set('views', viewsDir);
// Set static directory (js and css).
const staticDir = path_1.default.join(__dirname, 'public');
app.use(express_1.default.static(staticDir));
/******************************************************************************
                                Export default
******************************************************************************/
exports.default = app;
