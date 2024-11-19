"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function reverseBuffer(input, keyArray, initor) {
    var length = input.length;
    var reversed = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
        reversed[i] = input[length - 1 - i];
    }
    return reversed;
}
var funPair = {
    obfuscation: reverseBuffer,
    deobfuscation: reverseBuffer
};
exports.default = funPair;
