import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ConnectionTokenStore } from '../connection-token-store.js'
import type { Encryptor } from '../encryptor.js'

// A reversible fake Encryptor (identity round-trip) standing in for safeStorage, so
// the store's read/write path runs with no Electron. `available` gates disk writes.
class FakeEncryptor implements Encryptor
{
    constructor(private readonly available: boolean) {}
    public IsAvailable(): boolean { return this.available }
    public Encrypt(plain: string): Buffer { return Buffer.from(plain, 'utf8') }
    public Decrypt(blob: Buffer): string { return blob.toString('utf8') }
}

describe('ConnectionTokenStore', () =>
{
    it('round-trips a token to <userData>/conn-token-<id>.bin (byte-compat layout)', () =>
    {
        const dir = mkdtempSync(join(tmpdir(), 'p5b-'))
        const store = new ConnectionTokenStore(dir, new FakeEncryptor(true))
        store.SetToken('npm-public', 'secret')
        assert.ok((readdirSync(dir)).includes('conn-token-npm-public.bin'))
        assert.equal(store.HasToken('npm-public'), true)
        assert.equal(store.GetToken('npm-public'), 'secret')
    })

    it('reads a token file written in the exact devUI on-disk layout', () =>
    {
        const dir = mkdtempSync(join(tmpdir(), 'p5b-'))
        // Simulate a file written by pre-promotion devUI (same FakeEncryptor bytes).
        writeFileSync(join(dir, 'conn-token-legacy.bin'), Buffer.from('carried-over', 'utf8'))
        const store = new ConnectionTokenStore(dir, new FakeEncryptor(true))
        assert.equal(store.HasToken('legacy'), true)
        assert.equal(store.GetToken('legacy'), 'carried-over')
    })

    it('when the encryptor is unavailable, keeps tokens in memory and writes NO plaintext file', () =>
    {
        const dir = mkdtempSync(join(tmpdir(), 'p5b-'))
        const store = new ConnectionTokenStore(dir, new FakeEncryptor(false))
        store.SetToken('x', 'secret')
        assert.equal(store.GetToken('x'), 'secret')                      // session memory
        assert.equal(existsSync(join(dir, 'conn-token-x.bin')), false)   // never plaintext
    })

    it('Clear removes both the in-memory and on-disk token', () =>
    {
        const dir = mkdtempSync(join(tmpdir(), 'p5b-'))
        const store = new ConnectionTokenStore(dir, new FakeEncryptor(true))
        store.SetToken('y', 'secret')
        store.Clear('y')
        assert.equal(store.HasToken('y'), false)
        assert.equal(existsSync(join(dir, 'conn-token-y.bin')), false)
    })
})
