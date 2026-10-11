import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { NodeAesGcmEncryptor } from '../node-aes-gcm-encryptor.js'

test('round-trips a string through encrypt/decrypt', () =>
{
    const enc = new NodeAesGcmEncryptor(randomBytes(32))
    const blob = enc.Encrypt('s3cret-value')
    assert.equal(enc.Decrypt(blob), 's3cret-value')
    assert.equal(enc.IsAvailable(), true)
})

test('a tampered blob fails to decrypt', () =>
{
    const enc = new NodeAesGcmEncryptor(randomBytes(32))
    const blob = enc.Encrypt('x')
    blob[blob.length - 1] ^= 0xff
    assert.throws(() => enc.Decrypt(blob))
})

test('a different key cannot decrypt', () =>
{
    const blob = new NodeAesGcmEncryptor(randomBytes(32)).Encrypt('x')
    assert.throws(() => new NodeAesGcmEncryptor(randomBytes(32)).Decrypt(blob))
})

test('rejects a non-32-byte key with a secret-free error', () =>
{
    assert.throws(() => new NodeAesGcmEncryptor(randomBytes(16)), /32-byte key/)
})

test('FromBase64 builds a working encryptor', () =>
{
    const keyB64 = randomBytes(32).toString('base64')
    const enc = NodeAesGcmEncryptor.FromBase64(keyB64)
    assert.equal(enc.Decrypt(enc.Encrypt('y')), 'y')
})
