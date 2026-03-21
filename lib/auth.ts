import crypto from 'crypto';

/**
 * Replicates PHP's crc32 function which returns a signed 32-bit integer on 32-bit systems
 * but on 64-bit systems it's usually an unsigned 32-bit integer.
 * Based on the SQL dump hashes, we need to match what PHP produced.
 */
function crc32(str: string): number {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        table[i] = c;
    }

    let crc = 0xFFFFFFFF;
    for (let i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xFF];
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * PHP-compatible hashing logic:
 * md5(crc32(base64_encode((strrev($PASS) . salt))))
 */
export function phpHash(password: string): string {
    const salt = 'abgregistry';
    const reversed = password.split('').reverse().join('');
    const salted = reversed + salt;
    const base64 = Buffer.from(salted).toString('base64');
    const crc = crc32(base64);
    
    // PHP's md5(crc32(...)) uses the string representation of the number
    const hash = crypto.createHash('md5').update(crc.toString()).digest('hex');
    return hash;
}
