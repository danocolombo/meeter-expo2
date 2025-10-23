export const CryptoDigestAlgorithm = { SHA256: 'SHA256' };
export async function digestStringAsync(alg: string, input: string) {
    // deterministic-ish fake digest for tests
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return `fake-digest-${hash}`;
}
