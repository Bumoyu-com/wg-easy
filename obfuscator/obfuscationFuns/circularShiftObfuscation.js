"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Obfuscation function: Circular shift
function circularShiftObfuscation(input, keyArray, initor) {
    var obfuscated = new Uint8Array(input.length);
    for (var i = 0; i < input.length; i++) {
        obfuscated[i] = (input[i] << 1) | (input[i] >>> 7); // Circular left shift by 1 bit
    }
    return obfuscated;
}
// Deobfuscation function: Circular shift
function de_circularShiftObfuscation(input, keyArray, initor) {
    var deobfuscated = new Uint8Array(input.length);
    for (var i = 0; i < input.length; i++) {
        deobfuscated[i] = (input[i] >>> 1) | (input[i] << 7); // Circular right shift by 1 bit
    }
    return deobfuscated;
}
var funPair = {
    obfuscation: circularShiftObfuscation,
    deobfuscation: de_circularShiftObfuscation
};
exports.default = funPair;
