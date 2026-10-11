import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import type { Encryptor } from './encryptor.js'

/** Headless AES-256-GCM Encryptor (node:crypto); the non-electron counterpart to SafeStorageEncryptor. */
export class NodeAesGcmEncryptor implements Encryptor
{
    private static readonly Algorithm = 'aes-256-gcm'
    private static readonly IvLength = 12
    private static readonly AuthTagLength = 16
    private static readonly KeyLength = 32
    private static readonly Utf8 = 'utf8'
    private static readonly Base64 = 'base64'
    private static readonly InvalidKeyMessage = 'NodeAesGcmEncryptor requires a 32-byte key'

    private readonly key: Buffer

    public constructor(key: Buffer)
    {
        if (key.length !== NodeAesGcmEncryptor.KeyLength)
        {
            throw new Error(NodeAesGcmEncryptor.InvalidKeyMessage)
        }
        this.key = Buffer.from(key)
    }

    public static FromBase64(keyBase64: string): NodeAesGcmEncryptor
    {
        return new NodeAesGcmEncryptor(Buffer.from(keyBase64, NodeAesGcmEncryptor.Base64))
    }

    public IsAvailable(): boolean
    {
        return true
    }

    public Encrypt(plain: string): Buffer
    {
        const iv = randomBytes(NodeAesGcmEncryptor.IvLength)
        const cipher = createCipheriv(NodeAesGcmEncryptor.Algorithm, this.key, iv, { authTagLength: NodeAesGcmEncryptor.AuthTagLength })
        const ciphertext = Buffer.concat([cipher.update(plain, NodeAesGcmEncryptor.Utf8), cipher.final()])
        return Buffer.concat([iv, cipher.getAuthTag(), ciphertext])
    }

    public Decrypt(blob: Buffer): string
    {
        const tagEnd = NodeAesGcmEncryptor.IvLength + NodeAesGcmEncryptor.AuthTagLength
        const iv = blob.subarray(0, NodeAesGcmEncryptor.IvLength)
        const authTag = blob.subarray(NodeAesGcmEncryptor.IvLength, tagEnd)
        const ciphertext = blob.subarray(tagEnd)
        const decipher = createDecipheriv(NodeAesGcmEncryptor.Algorithm, this.key, iv, { authTagLength: NodeAesGcmEncryptor.AuthTagLength })
        decipher.setAuthTag(authTag)
        return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(NodeAesGcmEncryptor.Utf8)
    }
}
