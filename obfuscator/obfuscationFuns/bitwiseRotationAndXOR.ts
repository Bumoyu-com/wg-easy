function bitwiseRotationAndXOR(input: Uint8Array, keyArray: Uint8Array, initor:any): Uint8Array {
    const length = input.length;
    const rotatedXOR = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        const shift = (i % 8) + 1;
        rotatedXOR[i] = ((input[i] << shift) | (input[i] >>> (8 - shift))) ^ keyArray[(i + length - 1) % length];
    }

    return rotatedXOR;
}

function de_bitwiseRotationAndXOR(input: Uint8Array, keyArray: Uint8Array, initor:any): Uint8Array {
    const length = input.length;
    const de_rotatedXOR = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        const shift = (i % 8) + 1;
        de_rotatedXOR[i] = ((input[i] ^ keyArray[(i + length - 1) % length]) >>> shift) | ((input[i] ^ keyArray[(i + length - 1) % length]) << (8 - shift));
    }

    return de_rotatedXOR;
}

let funPair = {
    obfuscation: bitwiseRotationAndXOR,
    deobfuscation: de_bitwiseRotationAndXOR
}

export default funPair;