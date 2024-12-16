"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function reverseBits(input, keyArray, initor) {
    var reversed = new Uint8Array(input.length);
    for (var i = 0; i < input.length; i++) {
        var byte = input[i];
        var reversedByte = 0;
        for (var j = 0; j < 8; j++) {
            reversedByte <<= 1;
            reversedByte |= byte & 1;
            byte >>= 1;
        }
        reversed[i] = reversedByte;
    }
    return reversed;
}
function de_reverseBits(input, keyArray, initor) {
    var length = input.length;
    var deobfuscated = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
        var value = input[i];
        var result = 0;
        for (var j = 0; j < 8; j++) {
            result = (result << 1) | (value & 1);
            value >>= 1;
        }
        deobfuscated[i] = result;
    }
    return deobfuscated;
}
var funPair = {
    obfuscation: reverseBits,
    deobfuscation: de_reverseBits
};
exports.default = funPair;
