"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Obfuscator = void 0;
var ObfuscationFunctionHouse_1 = require("./ObfuscationFunctionHouse");
var crypto = require("crypto");
var DEBUG = false;
var Obfuscator = /** @class */ (function () {
    function Obfuscator(key, obfuscationLayer, paddingLength, funInitor) {
        this.key = key;
        this.paddingLength = paddingLength;
        this.obfuscationHouse = new ObfuscationFunctionHouse_1.ObfuscationFunctionHouse(obfuscationLayer, funInitor);
        this.obFunCombosLength = this.obfuscationHouse.getfunctionPairsIndexCombos().length;
    }
    Obfuscator.prototype.setKey = function (newKey) {
        this.key = newKey;
    };
    Obfuscator.prototype.generateKeyArray = function (length) {
        var keyArray = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
            keyArray[i] = (this.key + i * 37) % 256;
        }
        return keyArray;
    };
    Obfuscator.prototype.randomPadding = function (length) {
        return new Uint8Array(crypto.randomBytes(length).buffer);
    };
    Obfuscator.prototype.concatenateUint8Arrays = function (arrays) {
        var totalLength = arrays.reduce(function (acc, array) { return acc + array.length; }, 0);
        var result = new Uint8Array(totalLength);
        var offset = 0;
        for (var _i = 0, arrays_1 = arrays; _i < arrays_1.length; _i++) {
            var array = arrays_1[_i];
            result.set(array, offset);
            offset += array.length;
        }
        return result;
    };
    Obfuscator.prototype.extractHeaderAndBody = function (input) {
        var header = new Uint8Array(3);
        var body = new Uint8Array(input.length - 3 - input[2]);
        for (var i = 0; i < 3; i++) {
            header[i] = input[i];
        }
        for (var i = 0; i < body.length; i++) {
            body[i] = input[i + 3];
        }
        return { header: header, body: body };
    };
    Obfuscator.prototype.preObfuscation = function (buffer, functions) {
        var obfuscatedData = new Uint8Array(buffer);
        var keyArray = this.generateKeyArray(obfuscatedData.length);
        if (DEBUG) {
            console.log('\n\n\n');
        }
        for (var _i = 0, functions_1 = functions; _i < functions_1.length; _i++) {
            var func = functions_1[_i];
            if (DEBUG) {
                console.log('Original Data:', obfuscatedData);
            }
            obfuscatedData = func.obfuscation(obfuscatedData, keyArray, func.initor);
            if (DEBUG) {
                console.log('Obfuscated Data:', obfuscatedData);
                console.log('Function is:', func.obfuscation.name);
                console.log('----------------------------------');
            }
        }
        return obfuscatedData;
    };
    Obfuscator.prototype.preDeobfuscation = function (obfuscated, functions) {
        var deobfuscatedData = new Uint8Array(obfuscated);
        var keyArray = this.generateKeyArray(deobfuscatedData.length);
        if (DEBUG) {
            console.log('\n\n\n');
        }
        for (var i = functions.length - 1; i >= 0; i--) {
            if (DEBUG) {
                console.log('Original Data:', deobfuscatedData);
            }
            deobfuscatedData = functions[i].deobfuscation(deobfuscatedData, keyArray, functions[i].initor);
            if (DEBUG) {
                console.log('Obfuscated Data:', deobfuscatedData);
                console.log('Function is:', functions[i].deobfuscation.name);
                console.log('----------------------------------');
            }
        }
        return deobfuscatedData;
    };
    Obfuscator.prototype.obfuscation = function (data) {
        var that = this;
        var header = new Uint8Array(crypto.randomBytes(3).buffer);
        var fnComboIndex = (header[0] * header[1]) % this.obFunCombosLength;
        var fnCombo = this.obfuscationHouse.getfunctionPairsIndexCombos();
        var obfuscatedData = this.preObfuscation(data, fnCombo[fnComboIndex].map(function (it, idx) {
            return that.obfuscationHouse.functionPairs[it];
        }));
        // Generate random padding length
        var paddingLength = Math.floor(Math.random() * this.paddingLength) + 1;
        // Store padding length in header
        header[2] = paddingLength;
        // Generate random padding
        var padding = this.randomPadding(paddingLength);
        // Concatenate with new padding  
        var result = this.concatenateUint8Arrays([
            header,
            obfuscatedData,
            padding
        ]);
        return result;
    };
    Obfuscator.prototype.deobfuscation = function (data) {
        var that = this;
        var input = new Uint8Array(data);
        var _a = this.extractHeaderAndBody(input), header = _a.header, body = _a.body;
        var fnComboIndex = (header[0] * header[1]) % this.obFunCombosLength;
        var fnCombo = this.obfuscationHouse.getfunctionPairsIndexCombos();
        var deObfuscatedData = this.preDeobfuscation(body.buffer, fnCombo[fnComboIndex].map(function (it, idx) {
            return that.obfuscationHouse.functionPairs[it];
        }));
        return deObfuscatedData;
    };
    return Obfuscator;
}());
exports.Obfuscator = Obfuscator;
