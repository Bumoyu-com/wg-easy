"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Reversible obfuscation function: Bitwise XOR with a rolling key
function xorWithKey(input, keyArray, initor) {
    var length = input.length;
    var obfuscated = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
        obfuscated[i] = input[i] ^ keyArray[i];
    }
    return obfuscated;
}
var funPair = {
    obfuscation: xorWithKey,
    deobfuscation: xorWithKey
};
exports.default = funPair;
