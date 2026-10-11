import { NodeFsStorage } from '@pragmatic-tech-ai/todl-runtime/node'
import type { IStorage } from '@pragmatic-tech-ai/todl-runtime'

/** Node storage-provider registry: each location becomes a NodeFsStorage rooted there. */
export class NodeStorageProviderRegistry
{
    public CreateStorage(location: string): IStorage
    {
        return new NodeFsStorage(location)
    }
}
