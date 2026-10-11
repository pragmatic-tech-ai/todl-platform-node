import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { FileConnectionStore } from '../file-connection-store.js'

describe('FileConnectionStore', () =>
{
    it('reads a connections.json written in the devUI spec layout (byte-compat)', async () =>
    {
        const dir = mkdtempSync(join(tmpdir(), 'p5b-'))
        writeFileSync(join(dir, 'connections.json'), JSON.stringify({
            version: 2, defaultId: 'npm-public',
            connections: [{ Id: 'npm-public', DisplayName: 'npm public', RegistryType: 'npm', Settings: { registry: 'https://r' } }],
        }))
        const store = new FileConnectionStore(dir)
        const all = await store.All()
        assert.deepEqual(all.map((c) => c.Id), ['npm-public'])
        assert.equal(await store.DefaultId(), 'npm-public')
    })

    it('maps a pre-engine flat record to a ConnectionSpec on load', async () =>
    {
        const dir = mkdtempSync(join(tmpdir(), 'p5b-'))
        writeFileSync(join(dir, 'connections.json'), JSON.stringify({
            defaultId: 'legacy',
            connections: [{ id: 'legacy', name: 'Legacy', registry: 'https://r', scope: '@x', org: '', githubApi: '', tokenSource: 'env', tokenEnvVar: 'NPM_TOKEN' }],
        }))
        const spec = (await new FileConnectionStore(dir).All())[0]!
        assert.equal(spec.Id, 'legacy')
        assert.equal(spec.DisplayName, 'Legacy')
        assert.equal(spec.RegistryType, 'npm')
        assert.equal(spec.Settings.scope, '@x')
    })

    it('Save appends, adopts the first as default, and round-trips the spec format', async () =>
    {
        const dir = mkdtempSync(join(tmpdir(), 'p5b-'))
        const store = new FileConnectionStore(dir)
        await store.Save({ Id: 'a', DisplayName: 'A', RegistryType: 'npm', Settings: {} })
        assert.equal(await store.DefaultId(), 'a')
        const written = JSON.parse(readFileSync(join(dir, 'connections.json'), 'utf8'))
        assert.equal(written.connections[0].Id, 'a')
    })

    it('Delete removes the connection and repoints the default', async () =>
    {
        const dir = mkdtempSync(join(tmpdir(), 'p5b-'))
        const store = new FileConnectionStore(dir)
        await store.Save({ Id: 'a', DisplayName: 'A', RegistryType: 'npm', Settings: {} })
        await store.Save({ Id: 'b', DisplayName: 'B', RegistryType: 'npm', Settings: {} })
        await store.Delete('a')
        assert.deepEqual((await store.All()).map((c) => c.Id), ['b'])
        assert.equal(await store.DefaultId(), 'b')
    })
})
