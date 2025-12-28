import { WebEncryption, EncryptionOptions, EncryptionObject } from './libs/encryption';

export { WebEncryption, EncryptionOptions, EncryptionObject };

/**
 * Creates a new WebEncryption instance.
 * @param options Configuration options
 */
const webEncryption = (options?: EncryptionOptions) => {
    return new WebEncryption(options);
};

export default webEncryption;
