"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function swapNeighboringBytes(input, keyArray, initor) {
    var length = input.length;
    var swapped = new Uint8Array(length);
    for (var i = 0; i < length - 1; i += 2) {
        swapped[i] = input[i + 1];
        swapped[i + 1] = input[i];
    }
    if (length % 2 !== 0) {
        swapped[length - 1] = input[length - 1];
    }
    return swapped;
}
var funPair = {
    obfuscation: swapNeighboringBytes,
    deobfuscation: swapNeighboringBytes
};
exports.default = funPair;
