import { WebEncryption } from './encryption';

describe('WebEncryption', () => {
    it('should encrypt and decrypt correctly with default options', () => {
        const encryption = new WebEncryption();
        const original = 'Hello World';
        const encrypted = encryption.encrypt(original);
        const decrypted = encryption.decrypt(encrypted);

        expect(encrypted).not.toBe(original);
        expect(decrypted).toBe(original);
    });

    it('should maintain consistency with ID', () => {
        const encryption = new WebEncryption({ size: 10 });
        const ids = encryption.getIds();
        expect(ids.length).toBe(10);

        const id = ids[0];
        const original = 'Test Data';
        const encrypted = encryption.encrypt(original, id);
        const decrypted = encryption.decrypt(encrypted, id);

        expect(decrypted).toBe(original);
    });

    it('should handle custom character sets', () => {
        const encryption = new WebEncryption({
            characterSet: ['en']
        });
        const original = 'abc';
        const encrypted = encryption.encrypt(original);
        const decrypted = encryption.decrypt(encrypted);

        expect(decrypted).toBe(original);
    });

    it('should return original data if input is not string', () => {
        // @ts-ignore
        const encryption = new WebEncryption();
        // @ts-ignore
        expect(encryption.encrypt(123)).toBe(123);
        // @ts-ignore
        expect(encryption.decrypt(123)).toBe(123);
    });
});
