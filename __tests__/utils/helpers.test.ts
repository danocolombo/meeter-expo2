/// <reference types="jest" />
import { normalizePermissions } from '../../utils/helpers';

describe('normalizePermissions', () => {
    test('returns empty array for undefined/null', () => {
        expect(normalizePermissions(undefined)).toEqual([]);
        expect(normalizePermissions(null)).toEqual([]);
    });

    test('returns same array if array given', () => {
        expect(normalizePermissions(['a', 'b'])).toEqual(['a', 'b']);
        // filters falsy
        expect(normalizePermissions(['a', '', null as any])).toEqual(['a']);
    });

    test('splits comma separated string and trims', () => {
        expect(normalizePermissions('read, write,admin')).toEqual([
            'read',
            'write',
            'admin',
        ]);
    });

    test('handles empty string', () => {
        expect(normalizePermissions('')).toEqual([]);
    });
});
