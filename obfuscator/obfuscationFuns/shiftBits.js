"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function shiftBits(input, keyArray, initor) {
    var length = input.length;
    var obfuscated = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
        obfuscated[i] = (input[i] << 2) | (input[i] >> 6);
    }
    return obfuscated;
}
function de_shiftBits(obfuscated) {
    var length = obfuscated.length;
    var deobfuscated = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
        var shiftedValue = (obfuscated[i] >> 2) | (obfuscated[i] << 6);
        deobfuscated[i] = shiftedValue;
    }
    return deobfuscated;
}
var funPair = {
    obfuscation: shiftBits,
    deobfuscation: de_shiftBits
};
exports.default = funPair;
