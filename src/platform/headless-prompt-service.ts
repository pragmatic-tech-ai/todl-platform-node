import { Ask, ConfirmAsk, PickFolderAsk, PickFileAsk, PromptTextAsk, ChooseAsk } from '@pragmatic-tech-ai/todl-runtime'
import type { IPromptService, FileFilter, Choice } from '@pragmatic-tech-ai/todl-runtime'

/**
 * Non-interactive IPromptService for headless hosts (server/CLI). Confirm answers false so
 * nothing is silently discarded; every pick/prompt/choose is treated as cancelled (undefined).
 * An Ask of an unrecognized subclass throws rather than hanging or returning undefined.
 */
export class HeadlessPromptService implements IPromptService
{
    private static readonly UnsupportedAskMessage = 'HeadlessPromptService: this Ask type is not supported in a non-interactive host'

    public Ask<R>(request: Ask<R>): Promise<R>
    {
        if (request instanceof ConfirmAsk)
        {
            return Promise.resolve(false as R)
        }
        if (request instanceof PickFolderAsk || request instanceof PickFileAsk || request instanceof PromptTextAsk || request instanceof ChooseAsk)
        {
            return Promise.resolve(undefined as R)
        }
        return Promise.reject(new Error(HeadlessPromptService.UnsupportedAskMessage))
    }

    public Confirm(_message: string, _confirmLabel?: string): Promise<boolean>
    {
        return Promise.resolve(false)
    }

    public PickFolder(_title: string): Promise<string | undefined>
    {
        return Promise.resolve(undefined)
    }

    public PickFile(_title: string, _filters?: readonly FileFilter[]): Promise<string | undefined>
    {
        return Promise.resolve(undefined)
    }

    public PromptText(_label: string, _initial?: string): Promise<string | undefined>
    {
        return Promise.resolve(undefined)
    }

    public Choose<T>(_title: string, _options: readonly Choice<T>[]): Promise<T | undefined>
    {
        return Promise.resolve(undefined)
    }
}
