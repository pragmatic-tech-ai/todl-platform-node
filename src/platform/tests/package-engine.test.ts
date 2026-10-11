import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PackageEngine } from '../package-engine.js'
import { FileConnectionStore } from '../file-connection-store.js'
import { EncryptedSecretStore } from '../encrypted-secret-store.js'
import { ConnectionTokenStore } from '../connection-token-store.js'
import { ProcessEnvironmentVariables } from '../process-environment-variables.js'
import type { Encryptor } from '../encryptor.js'

class FakeEncryptor implements Encryptor
{
    public IsAvailable(): boolean { return true }
    public Encrypt(plain: string): Buffer { return Buffer.from(plain, 'utf8') }
    public Decrypt(blob: Buffer): string { return blob.toString('utf8') }
}

class PackageEngineFixture
{
    public static Over(dir: string): PackageEngine
    {
        return new PackageEngine({
            connectionStore: new FileConnectionStore(dir),
            secretStore: new EncryptedSecretStore(new ConnectionTokenStore(dir, new FakeEncryptor())),
            environment: new ProcessEnvironmentVariables({}),
        })
    }
}

describe('PackageEngine', () =>
{
    it('composes a PackageManagerService that starts with no connections', async () =>
    {
        const engine = PackageEngineFixture.Over(mkdtempSync(join(tmpdir(), 'p5b-')))
        assert.deepEqual(await engine.Service.ListViews(), [])
    })

    it('after AddConnection a matching ConnectionView is listed', async () =>
    {
        const engine = PackageEngineFixture.Over(mkdtempSync(join(tmpdir(), 'p5b-')))
        await engine.Service.AddConnection({ Id: 'npm-public', DisplayName: 'npm-public', RegistryType: 'npm', Settings: {} })
        const views = await engine.Service.ListViews()
        assert.ok((views.map((v) => v.DisplayName)).includes('npm-public'))
    })
})
