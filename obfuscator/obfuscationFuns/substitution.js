"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function substitution(input, keyArray, initor) {
    var length = input.length;
    var obfuscated = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
        obfuscated[i] = initor[input[i]];
    }
    return obfuscated;
}
function de_substitution(input, keyArray, initor) {
    var length = input.length;
    var deobfuscated = new Uint8Array(length);
    var _loop_1 = function (i) {
        var value = input[i];
        // Find the index of the value in the table
        var index = initor.findIndex(function (item) { return item === value; });
        if (index !== -1) {
            deobfuscated[i] = index;
        }
        else {
            // Handle the case where the value is not found in the table
            // You can decide on an appropriate fallback behavior or error handling here
            // For example, you can set deobfuscated[i] = 0 or throw an error
            deobfuscated[i] = 0;
        }
    };
    for (var i = 0; i < length; i++) {
        _loop_1(i);
    }
    return deobfuscated;
}
function generateSubstitutionTable() {
    var tableLength = 256;
    var substitutionTable = [];
    // Initialize the table with sequential values from 0 to 255
    for (var i = 0; i < tableLength; i++) {
        substitutionTable.push(i);
    }
    // Shuffle the table using Fisher-Yates algorithm
    for (var i = tableLength - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = substitutionTable[i];
        substitutionTable[i] = substitutionTable[j];
        substitutionTable[j] = temp;
    }
    return substitutionTable;
}
var funPair = {
    obfuscation: substitution,
    deobfuscation: de_substitution,
    initorFn: generateSubstitutionTable
};
exports.default = funPair;
