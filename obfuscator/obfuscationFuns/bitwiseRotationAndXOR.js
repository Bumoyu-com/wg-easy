"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function bitwiseRotationAndXOR(input, keyArray, initor) {
    var length = input.length;
    var rotatedXOR = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
        var shift = (i % 8) + 1;
        rotatedXOR[i] = ((input[i] << shift) | (input[i] >>> (8 - shift))) ^ keyArray[(i + length - 1) % length];
    }
    return rotatedXOR;
}
function de_bitwiseRotationAndXOR(input, keyArray, initor) {
    var length = input.length;
    var de_rotatedXOR = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
        var shift = (i % 8) + 1;
        de_rotatedXOR[i] = ((input[i] ^ keyArray[(i + length - 1) % length]) >>> shift) | ((input[i] ^ keyArray[(i + length - 1) % length]) << (8 - shift));
    }
    return de_rotatedXOR;
}
var funPair = {
    obfuscation: bitwiseRotationAndXOR,
    deobfuscation: de_bitwiseRotationAndXOR
};
exports.default = funPair;
