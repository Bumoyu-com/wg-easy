"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fnInitor = void 0;
var substitution_1 = require("./obfuscationFuns/substitution");
var addRandomValue_1 = require("./obfuscationFuns/addRandomValue");
function fnInitor() {
    return {
        substitutionTable: substitution_1.default.initorFn(),
        randomValue: addRandomValue_1.default.initorFn(),
    };
}
exports.fnInitor = fnInitor;
