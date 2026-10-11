import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Ask, ConfirmAsk, PickFolderAsk, PickFileAsk, PromptTextAsk, ChooseAsk } from '@pragmatic-tech-ai/todl-runtime'
import { HeadlessPromptService } from '../headless-prompt-service.js'

class UnknownAsk extends Ask<string>
{
}

test('Confirm returns false (never silently discards)', async () =>
{
    assert.equal(await new HeadlessPromptService().Confirm('discard?'), false)
})

test('pick/prompt/choose return undefined (cancelled)', async () =>
{
    const p = new HeadlessPromptService()
    assert.equal(await p.PickFolder('t'), undefined)
    assert.equal(await p.PickFile('t'), undefined)
    assert.equal(await p.PromptText('l'), undefined)
    assert.equal(await p.Choose('t', []), undefined)
})

test('Ask dispatches on the concrete Ask subclass', async () =>
{
    const p = new HeadlessPromptService()
    assert.equal(await p.Ask(new ConfirmAsk('discard?')), false)
    assert.equal(await p.Ask(new PickFolderAsk('t')), undefined)
    assert.equal(await p.Ask(new PickFileAsk('t')), undefined)
    assert.equal(await p.Ask(new PromptTextAsk('l')), undefined)
    assert.equal(await p.Ask(new ChooseAsk('t', [])), undefined)
})

test('an unrecognized Ask throws', async () =>
{
    await assert.rejects(() => new HeadlessPromptService().Ask(new UnknownAsk()), /not supported/)
})
