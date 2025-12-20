# Web Encryption

Cross platform (web and nodejs) asymmetric and symmetric encryption.
Rewritten in TypeScript for better type safety and modern usage, while maintaining backward compatibility.

## Installation

```bash
npm install web-encryption
```

## Usage

### Basic Usage

The library provides a default factory function for quick usage:

```typescript
import webEncryption from 'web-encryption';

const encryption = webEncryption();
const secret = "Hello World";

const encrypted = encryption.encrypt(secret);
console.log(encrypted);

const decrypted = encryption.decrypt(encrypted);
console.log(decrypted); // Hello World
```

### Class-Based Usage (Recommended)

For better control and multiple independent instances, use the `WebEncryption` class:

```typescript
import { WebEncryption } from 'web-encryption';

// Initialize with options
const encryption = new WebEncryption({
    size: 100,
    characterSet: ['en', 'number']
});

const secret = "Sensitive Data";
const id = encryption.getIds()[0]; // Use a specific ID mapping if needed

const encrypted = encryption.encrypt(secret, id);
const decrypted = encryption.decrypt(encrypted, id);
```

### Options

| Option | Type | Default | Description |
|Params|---|---|---|
| `size` | number | 100 | Number of encryption mapping objects to generate |
| `characterSet` | string[] | `['tr', 'number']` | Predefined character sets to use (e.g. 'en', 'tr') |
| `characters` | string[] | - | Custom array of characters to use for encryption |

## Workflow & Security Architecture

This library is designed to be part of a secure end-to-end data flow:

1.  **Backend Setup**: The developer generates a set of encryption lists (permutations) and saves them to a database.
2.  **Login Flow**: 
    *   When a client logs in, a random encryption mapping is fetched from the database.
    *   The unique **ID** of this mapping is stored in the user's JWT (or session).
    *   The **encryption mapping** (the visual permutation logic) is sent to the client in the login response.
3.  **Data Exchange**:
    *   **Client -> Server**: The client encrypts any sensitive data using the mapping received during login. The server uses the ID from the JWT to find the corresponding decryption key.
    *   **Server -> Client**: The server encrypts the response data. The client uses its stored local mapping to view the content.

This approach ensures that even if the data traffic is intercepted, the payload is meaningless without the specific ephemeral permutation map used for that session.

## License

MIT
