import { setFailed } from '@actions/core'
import * as github from '@actions/github'
import parseDiff from 'parse-diff'
import { getArgs } from './args'
import { PROMPT } from './consts'
import { filterDiff } from './diff'
import { promptOpenRouter } from './openai'
import { OpenRouterResponse } from './types'

export const getOctokit = () => {
    const { githubToken } = getArgs()
    return github.getOctokit(githubToken)
}

const octokit = getOctokit()


const owner = github.context.repo.owner
const repo = github.context.repo.repo

const getAuthenticatedUsername = async (): Promise<string> => {
    const { data } = await octokit.rest.users.getAuthenticated()
    return data.login
}

const getDiff = async (pullNumber: number): Promise<string | null> => {
    const response = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
        mediaType: { format: 'diff' },
    })
    // @ts-expect-error - response.data is a string
    return response.data
}

const findExistingReview = async (pullNumber: number): Promise<number | null> => {
    const reviews = await octokit.rest.pulls.listReviews({
        owner,
        repo,
        pull_number: pullNumber,
    })

    const authenticatedUsername = await getAuthenticatedUsername()
    const botReview = reviews.data.find((review) => review.user?.login === authenticatedUsername)

    return botReview?.id ?? null
}

const leaveReviewComment = async ({
    pullNumber,
    body,
    comments,
}: {
    pullNumber: number
    body: string
    comments?: Array<{ body: string; path: string; line?: number }>
}): Promise<void> => {
    const existingReviewId = await findExistingReview(pullNumber)

    if (existingReviewId) {
        await octokit.rest.pulls.updateReview({
            owner,
            repo,
            pull_number: pullNumber,
            review_id: existingReviewId,
            body,
        })
    } else {
        await octokit.rest.pulls.createReview({
            owner,
            repo,
            pull_number: pullNumber,
            body,
            comments,
            event: 'COMMENT',
        })
    }
}

const createPrompt = (diff: string) => `
    ${PROMPT}
    ${diff}
    `

const createReviewBody = (response: string) => {
    return `${response}\n\nto get an updated review, request a review from me in the pr Reviewers section.`
}
const main = async () => {
    const { exclude, maxLines, pullNumber: pullNumberString, model, openAiApiKey, openAiUrl } = getArgs()
    const pullNumber = parseInt(pullNumberString)
    console.log('Review arguments:', JSON.stringify({ pullNumber, model, exclude, maxLines }, null, 2))

    const prDiff = await getDiff(pullNumber)

    if (!prDiff) {
        throw new Error('No diff found for pull request #' + pullNumber)
    }

    const parsedDiff = parseDiff(prDiff)

    const excludePatterns = exclude.split(',').map((s) => s.trim())
    const filteredDiff = filterDiff(parsedDiff, excludePatterns)
    const concatedDiff = filteredDiff
        .map((file) =>
            file.chunks
                .map((chunk) => `\n\nfile: ${file.to}\n${chunk.changes.map((change) => change.content).join('\n')}`)
                .join('\n')
        )
        .join('\n')

    if (concatedDiff.split('\n').length > parseInt(maxLines)) {
        leaveReviewComment({ pullNumber, body: `this pr is too long for me to review.` })
        throw new Error(`Diff exceeds max lines - lines: ${concatedDiff.split('\n').length}, max: ${maxLines}`)
    }

    const response = await promptOpenRouter({
        apiKey: openAiApiKey,
        prompt: createPrompt(concatedDiff),
        model: model,
        baseURL: openAiUrl,
    })

    const data: OpenRouterResponse = await response.json()
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.log(JSON.stringify(data, null, 2))
        throw new Error('Improper response from OpenRouter')
    }
    const responseMessage = data.choices[0].message.content
    console.log(`response: ${responseMessage}`)
    console.log('Token usage:', JSON.stringify(data.usage, null, 2))
    const reviewBody = createReviewBody(responseMessage)

    leaveReviewComment({ pullNumber, body: reviewBody })
}

main().catch((error) => {
    console.log(`Failed to run ai code review: ${error}`)
    setFailed(error.message)
    throw error
})
