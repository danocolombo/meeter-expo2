// Simple in-memory callback registry to allow screens to register a
// callback that other screens can invoke by key. This avoids trying to
// serialize functions across navigation params. Callbacks are removed
// after invocation to avoid leaks.

type Callback = (...args: any[]) => void;

const callbacks = new Map<string, Callback>();

export function registerCallback(key: string, cb: Callback) {
    if (!key || typeof cb !== 'function') return false;
    callbacks.set(key, cb);
    return true;
}

export function invokeCallback(key: string, ...args: any[]) {
    const cb = callbacks.get(key);
    if (!cb) return false;
    try {
        cb(...args);
    } finally {
        callbacks.delete(key);
    }
    return true;
}

export function unregisterCallback(key: string) {
    if (!key) return false;
    return callbacks.delete(key);
}

export function hasCallback(key: string) {
    return callbacks.has(key);
}

export default {
    registerCallback,
    invokeCallback,
    unregisterCallback,
    hasCallback,
};
