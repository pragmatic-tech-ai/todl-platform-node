import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { NodeStorageProviderRegistry } from '../node-storage-provider-registry.js'

test('CreateStorage roots a NodeFsStorage at the given location (read/write round-trips)', async () =>
{
    const dir = mkdtempSync(join(tmpdir(), 'spn-'))
    try
    {
        const storage = new NodeStorageProviderRegistry().CreateStorage(dir)
        await storage.WriteText('a.txt', 'hello')
        assert.equal(await storage.ReadText('a.txt'), 'hello')
        assert.equal(readFileSync(join(dir, 'a.txt'), 'utf8'), 'hello')
    }
    finally
    {
        rmSync(dir, { recursive: true, force: true })
    }
})
