import { WebEncryption, type EncryptionOptions } from './libs/encryption';

export { WebEncryption, type EncryptionOptions };

/**
 * Creates a new WebEncryption instance.
 * @param options Configuration options
 */
const webEncryption = (options?: EncryptionOptions) => {
    return new WebEncryption(options);
};

export default webEncryption;
