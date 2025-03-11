"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const module_alias_1 = __importDefault(require("module-alias"));
module_alias_1.default.addAlias('@src', __dirname);
const jet_logger_1 = __importDefault(require("jet-logger"));
const ENV_1 = __importDefault(require("@src/common/ENV"));
const server_1 = __importDefault(require("./server"));
/******************************************************************************
                                  Run
******************************************************************************/
const SERVER_START_MSG = 'Express server started on port: ' + ENV_1.default.Port.toString();
server_1.default.listen(ENV_1.default.Port, () => jet_logger_1.default.info(SERVER_START_MSG));
