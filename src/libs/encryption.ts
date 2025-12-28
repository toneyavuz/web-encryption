import { CHARACTER_SETS } from './characters';

export type EncryptionOptions = {
    size?: number;
    characterSet?: string[];
    characters?: string[];
    mappingObjects?: EncryptionObject[];
}

export type EncryptionObject = {
    id: string;
    encrypt: Record<string, string>;
    decrypt: Record<string, string>;
    characters: string[];
}

export class WebEncryption {
    private objects: EncryptionObject[] = [];
    private options: EncryptionOptions;
    private ids: string[] = [];

    constructor(options: EncryptionOptions = {}) {
        this.options = {
            size: 100,
            characterSet: ['tr', 'number'],
            ...options
        };

        // Normalize size
        if (typeof this.options.size !== 'number') {
            this.options.size = parseInt(this.options.size as any, 10);
        }

        // Initialize characters
        if (this.options.characters) {
            if (!Array.isArray(this.options.characters)) {
                console.warn('WebEncryption: characters must be an array. Falling back to default.');
                this.options.characters = undefined;
            }
        }

        if (!this.options.characters && Array.isArray(this.options.characterSet)) {
            let combinedChars: string[] = [];
            for (const setKey of this.options.characterSet) {
                if (CHARACTER_SETS[setKey]) {
                    combinedChars = combinedChars.concat(CHARACTER_SETS[setKey]);
                } else {
                    console.warn(`WebEncryption: Character set '${setKey}' not found.`);
                }
            }
            if (combinedChars.length > 0) {
                this.options.characters = combinedChars;
            }
        }


        if (this.options.mappingObjects) {
            this.loadEncryptionObjects(this.options.mappingObjects);
        } else if (this.options.characters) {
            this.createObjects([...this.options.characters]);
            this.createIdArray();
        } else {
            console.error('WebEncryption: No valid characters available for encryption.');
        }
    }

    /**
     * Encrypts the data using the mapping associated with the given ID (or the first one if not provided).
     */
    public encrypt(data: string, id?: string): string {
        if (typeof data !== 'string') {
            console.error(`WebEncryption: encrypt expected string, got ${typeof data}`);
            return data;
        }

        if (!id && this.objects.length > 0) {
            id = this.objects[0].id;
        }

        const item = this.objects.find(obj => obj.id === id);

        if (!item) {
            console.error(`WebEncryption: Internal encryption object with id '${id}' not found.`);
            return data;
        }

        let dataChanged = '';
        for (let i = 0; i < data.length; i++) {
            dataChanged += item.encrypt[data[i]] || data[i];
        }
        return dataChanged;
    }

    /**
     * Decrypts the data using the mapping associated with the given ID.
     */
    public decrypt(data: string, id?: string): string {
        if (typeof data !== 'string') {
            console.error(`WebEncryption: decrypt expected string, got ${typeof data}`);
            return data;
        }

        if (!id && this.objects.length > 0) {
            id = this.objects[0].id;
        }

        const item = this.objects.find(obj => obj.id === id);

        if (!item) {
            console.error(`WebEncryption: Internal encryption object with id '${id}' not found.`);
            return data;
        }

        let dataChanged = '';
        for (let i = 0; i < data.length; i++) {
            dataChanged += item.decrypt[data[i]] || data[i];
        }
        return dataChanged;
    }

    /**
     * Helper to get available IDs
     */
    public getIds(): string[] {
        return this.ids;
    }

    private createIdArray() {
        this.ids = this.objects.map(obj => obj.id);
    }

    /**
     * Returns the internal encryption objects (passwords/mappings).
     * WARNING: This exposes the keys used for encryption.
     */
    public getEncryptionObjects(): EncryptionObject[] {
        return this.objects;
    }

    /**
     * Loads previously created encryption objects.
     * @param objects Array of EncryptionObject
     */
    public loadEncryptionObjects(objects: EncryptionObject[]): void {
        if (!Array.isArray(objects)) {
            console.error('WebEncryption: load expected array of EncryptionObject');
            return;
        }
        this.objects = objects;
        this.createIdArray();
    }

    private createObjects(initialCharacters: string[]) {
        this.objects = [];
        const size = this.options.size || 100;

        for (let i = 0; i < size; i++) {
            let id: string;
            let exists = false;

            // Generate unique ID
            do {
                id = Math.round(Math.random() * 23422166453).toString();
                exists = this.objects.some(obj => obj.id === id);
            } while (exists);

            // Create shuffled character mapping
            // Note: We copy the array to avoid mutating the original reference for the next iteration?
            // Actually original code reused 'characters' but mutated it inside the loop using strict logic:
            // "var placeHolder = characters[j]..." which shuffles IT.
            // Wait, the original code passed 'characters' to createObject.
            // inside createObject loop:
            // it shuffles 'characters'.
            // THEN it uses that shuffled characters to create mappings.
            // The NEXT iteration uses the ALREADY SHUFFLED characters and shuffles them AGAIN.
            // So we should maintain a working copy of characters.

            const currentChars = [...initialCharacters]; // Start fresh or shuffle previous?
            // Original code:
            // function createObject(characters) { ...
            //   for (...) { 
            //      ...
            //      for (j...) { ... characters[j] = ... } // Mutates 'characters' argument
            //   }
            // }
            // So it keeps mutating the SAME array passed in.
            // However, for semantic correctness and randomness, it probably doesn't matter much if we start fresh or continue shuffling,
            // but to be safe/clean let's correct the logic to be robust. 
            // Actually, simply shuffling a fresh copy each time is easier to reason about.
            // But to replicate "exact" logic I should pass a mutable array? 
            // No, the original logic was a bit weird. Let's just shuffle a copy.

            // Fisher-Yates shuffle is better, but I will stick to something similar to original for now or just standard shuffle.
            // Original used a loop with random swap.

            this.shuffleArray(currentChars);

            const item: EncryptionObject = {
                id: id,
                encrypt: {},
                decrypt: {},
                characters: [...currentChars] // Store the state of characters for this object
            };

            for (let j = 0; j < currentChars.length; j++) {
                // Mapping consistent with original:
                // item.encrypt[characters[j]] = characters[last - j]
                const char = currentChars[j];
                const mappedChar = currentChars[currentChars.length - 1 - j];

                item.encrypt[char] = mappedChar;
                item.decrypt[mappedChar] = char;
            }

            this.objects.push(item);
        }
    }

    private shuffleArray(array: string[]) {
        for (let j = 0; j < array.length; j++) {
            const random = Math.floor(Math.random() * (array.length - 1));
            const placeHolder = array[j];
            array[j] = array[random];
            array[random] = placeHolder;
        }
    }
}
