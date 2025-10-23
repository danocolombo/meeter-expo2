import { UserProfile } from '../../types/interfaces';
import { getPermissionsForActiveOrg } from '../../utils/helpers';

describe('getPermissionsForActiveOrg', () => {
    test('returns [] when activeOrg missing', () => {
        const profile = {} as any as UserProfile;
        expect(getPermissionsForActiveOrg(profile)).toEqual([]);
    });

    test('handles affiliations as array and filters active roles for org', () => {
        const profile = {
            activeOrg: { id: 'org-1' },
            affiliations: [
                { organizationId: 'org-1', role: 'manage', status: 'active' },
                { organizationId: 'org-1', role: 'meals', status: 'inactive' },
                { organizationId: 'org-2', role: 'groups', status: 'active' },
            ],
        } as any as UserProfile;

        expect(getPermissionsForActiveOrg(profile)).toEqual(['manage']);
    });

    test('handles affiliations wrapped in items', () => {
        const profile = {
            activeOrg: { id: 'org-2' },
            affiliations: {
                items: [
                    {
                        organizationId: 'org-2',
                        role: 'meals',
                        status: 'active',
                    },
                    {
                        organizationId: 'org-2',
                        role: 'groups',
                        status: 'active',
                    },
                ],
            },
        } as any as UserProfile;

        const perms = getPermissionsForActiveOrg(profile);
        expect(perms).toEqual(['groups', 'meals']); // sorted
    });

    test('handles nested organization.id field', () => {
        const profile = {
            activeOrg: { id: 'org-3' },
            affiliations: [
                {
                    organization: { id: 'org-3' },
                    role: 'manage',
                    status: 'active',
                },
                {
                    organization: { id: 'org-3' },
                    role: 'manage',
                    status: 'active',
                },
            ],
        } as any as UserProfile;

        // should dedupe and return single 'manage'
        expect(getPermissionsForActiveOrg(profile)).toEqual(['manage']);
    });

    test('returns empty array when no active affiliations', () => {
        const profile = {
            activeOrg: { id: 'org-4' },
            affiliations: [
                { organizationId: 'org-4', role: 'manage', status: 'inactive' },
            ],
        } as any as UserProfile;

        expect(getPermissionsForActiveOrg(profile)).toEqual([]);
    });
});
