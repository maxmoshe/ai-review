// import { getIsPullRequest } from '@/actions/lib'
import { getInput } from '@actions/core'
import { OPENAI_URL } from './consts'

export const getArgs = () => {
    const githubToken = getInput('githubToken')
    const openAiUrl = getInput('openAiUrl') || OPENAI_URL
    const openAiApiKey = getInput('openAiApiKey')
    const model = getInput('model')
    const exclude = getInput('exclude') || '.*\\.js, .*\\.js\\.map'
    const maxLines = getInput('maxLines')
    const pullNumber = getInput('pullNumber')

    const inputs = {
        githubToken,
        openAiApiKey,
        model,
        openAiUrl,
        exclude,
        maxLines,
        pullNumber,
    }

    return inputs
}
