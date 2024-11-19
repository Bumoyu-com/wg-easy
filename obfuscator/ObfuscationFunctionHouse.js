"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObfuscationFunctionHouse = void 0;
var bitwiseNOT_1 = require("./obfuscationFuns/bitwiseNOT");
var bitwiseRotationAndXOR_1 = require("./obfuscationFuns/bitwiseRotationAndXOR");
var swapNeighboringBytes_1 = require("./obfuscationFuns/swapNeighboringBytes");
var reverseBuffer_1 = require("./obfuscationFuns/reverseBuffer");
var divideAndSwap_1 = require("./obfuscationFuns/divideAndSwap");
var circularShiftObfuscation_1 = require("./obfuscationFuns/circularShiftObfuscation");
var xorWithKey_1 = require("./obfuscationFuns/xorWithKey");
var reverseBits_1 = require("./obfuscationFuns/reverseBits");
var shiftBits_1 = require("./obfuscationFuns/shiftBits");
var substitution_1 = require("./obfuscationFuns/substitution");
var addRandomValue_1 = require("./obfuscationFuns/addRandomValue");
var ObfuscationFunctionHouse = /** @class */ (function () {
    function ObfuscationFunctionHouse(obsfucationLayer, fnInitor) {
        this.functionPairs = [];
        this.obfuscationLayer = 4;
        this.functionPairsIndexCombos_1 = [];
        this.functionPairsIndexCombos_2 = [];
        this.functionPairsIndexCombos_3 = [];
        this.functionPairsIndexCombos_4 = [];
        // Add your desired obfuscation function pairs here
        this.addFunctionPair(bitwiseRotationAndXOR_1.default.obfuscation, bitwiseRotationAndXOR_1.default.deobfuscation);
        this.addFunctionPair(swapNeighboringBytes_1.default.obfuscation, swapNeighboringBytes_1.default.deobfuscation);
        this.addFunctionPair(reverseBuffer_1.default.obfuscation, reverseBuffer_1.default.deobfuscation);
        this.addFunctionPair(divideAndSwap_1.default.obfuscation, divideAndSwap_1.default.deobfuscation);
        this.addFunctionPair(circularShiftObfuscation_1.default.obfuscation, circularShiftObfuscation_1.default.deobfuscation);
        this.addFunctionPair(xorWithKey_1.default.obfuscation, xorWithKey_1.default.deobfuscation);
        this.addFunctionPair(bitwiseNOT_1.default.obfuscation, bitwiseNOT_1.default.deobfuscation);
        this.addFunctionPair(reverseBits_1.default.obfuscation, reverseBits_1.default.deobfuscation);
        this.addFunctionPair(shiftBits_1.default.obfuscation, shiftBits_1.default.deobfuscation);
        this.addFunctionPair(substitution_1.default.obfuscation, substitution_1.default.deobfuscation, fnInitor.substitutionTable);
        this.addFunctionPair(addRandomValue_1.default.obfuscation, addRandomValue_1.default.deobfuscation, fnInitor.randomValue);
        // Add more function pairs as needed
        this.setObfuscationLayer(obsfucationLayer);
        this.functionPairsIndexCombos_1 = this.calculatePermutations(this.functionPairs.length, 1);
        this.functionPairsIndexCombos_2 = this.calculatePermutations(this.functionPairs.length, 2);
        this.functionPairsIndexCombos_3 = this.calculatePermutations(this.functionPairs.length, 3);
        this.functionPairsIndexCombos_4 = this.calculatePermutations(this.functionPairs.length, 4);
    }
    ObfuscationFunctionHouse.prototype.setObfuscationLayer = function (num) {
        if (num > 4) {
            throw new Error("Support max layer 4.");
        }
        this.obfuscationLayer = num;
    };
    ObfuscationFunctionHouse.prototype.getfunctionPairsIndexCombos = function () {
        switch (this.obfuscationLayer) {
            case 1:
                return this.functionPairsIndexCombos_1;
                break;
            case 2:
                return this.functionPairsIndexCombos_2;
                break;
            case 3:
                return this.functionPairsIndexCombos_3;
                break;
            case 4:
                return this.functionPairsIndexCombos_4;
                break;
            default: return [];
        }
    };
    ObfuscationFunctionHouse.prototype.calculatePermutations = function (optionLength, length) {
        var options = Array.from({ length: optionLength }, function (_, i) { return i; });
        var permutations = [];
        function permute(current, remaining) {
            if (current.length === length) {
                permutations.push(current);
                return;
            }
            var _loop_1 = function (i) {
                var next = current.concat(remaining[i]);
                var rest = remaining.filter(function (_, index) { return index !== i; });
                permute(next, rest);
            };
            for (var i = 0; i < remaining.length; i++) {
                _loop_1(i);
            }
        }
        permute([], options);
        return permutations;
    };
    // Get a random obfuscation function pair
    ObfuscationFunctionHouse.prototype.getRandomFunctionPair = function () {
        var index = Math.floor(Math.random() * this.functionPairs.length);
        return this.functionPairs[index];
    };
    ObfuscationFunctionHouse.prototype.addFunctionPair = function (obfuscation, deobfuscation, initor) {
        var index = this.functionPairs.length;
        //To keep combination header as small as 2 bytes, we can only hold 17 functions most.
        if (index >= 17) {
            throw new Error("obfuscationFunctionHouse can only hold 17 functions most.");
        }
        this.functionPairs.push({ obfuscation: obfuscation, deobfuscation: deobfuscation, initor: initor, index: index });
    };
    // Get n distinct random obfuscation function pairs
    ObfuscationFunctionHouse.prototype.getRandomDistinctFunctionPairs = function (n) {
        var _a;
        if (n > this.functionPairs.length) {
            throw new Error("Cannot retrieve ".concat(n, " distinct function pairs from the available options."));
        }
        var shuffledPairs = this.functionPairs.slice();
        for (var i = shuffledPairs.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            _a = [shuffledPairs[j], shuffledPairs[i]], shuffledPairs[i] = _a[0], shuffledPairs[j] = _a[1];
        }
        return shuffledPairs.slice(0, n);
    };
    return ObfuscationFunctionHouse;
}());
exports.ObfuscationFunctionHouse = ObfuscationFunctionHouse;
