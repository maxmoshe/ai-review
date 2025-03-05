export type OpenRouterResponse = {
    provider: string
    model: string
    usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
    choices: {
        message: {
            content: string
        }
    }[]
}
