// import { getIsPullRequest } from '@/actions/lib'
import { getInput } from '@actions/core'
import { OPENAI_URL } from './consts'

export const getArgs = () => {
    const githubToken = getInput('githubToken')
    const openAiUrl = getInput('openAiUrl') || OPENAI_URL
    const openAiApiKey = getInput('openAiApiKey')
    const model = getInput('model')
    const prompt = getInput('prompt')
    const exclude = getInput('exclude') || '.*\\.js, .*\\.js\\.map'
    const maxLines = getInput('maxLines')
    const pullNumber = getInput('pullNumber')
    const updateReview = getInput('updateReview')
    const allowDataCollection = getInput('allowDataCollection') === 'true'

    const inputs = {
        githubToken,
        openAiApiKey,
        model,
        prompt,
        openAiUrl,
        exclude,
        maxLines,
        pullNumber,
        updateReview,
        allowDataCollection,
    }

    return inputs
}
