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
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // @ts-ignore
        const encryption = new WebEncryption();
        // @ts-ignore
        expect(encryption.encrypt(123)).toBe(123);
        // @ts-ignore
        expect(encryption.decrypt(123)).toBe(123);

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should load previously saved encryption objects', () => {
        const encryption1 = new WebEncryption();
        const encryptionObjects = encryption1.getEncryptionObjects();
        const originalData = 'Secret Data';
        const encryptedData = encryption1.encrypt(originalData);

        const encryption2 = new WebEncryption();
        // Should not be able to decrypt with different random keys
        expect(encryption2.decrypt(encryptedData)).not.toBe(originalData);

        // Load keys from first instance
        encryption2.loadEncryptionObjects(encryptionObjects);

        expect(encryption2.decrypt(encryptedData)).toBe(originalData);
    });


    it('should load encryption objects via constructor', () => {
        const encryption1 = new WebEncryption();
        const encryptionObjects = encryption1.getEncryptionObjects();
        const originalData = 'Secret Data Constructor';
        const encryptedData = encryption1.encrypt(originalData);

        const encryption2 = new WebEncryption({ mappingObjects: encryptionObjects });

        expect(encryption2.decrypt(encryptedData)).toBe(originalData);
    });

    it('should ignore invalid load input', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const encryption = new WebEncryption();
        // @ts-ignore
        encryption.loadEncryptionObjects('invalid');
        expect(consoleSpy).toHaveBeenCalledWith('WebEncryption: load expected array of EncryptionObject');
        consoleSpy.mockRestore();
    });
});
