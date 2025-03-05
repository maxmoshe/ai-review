export const promptOpenRouter = async ({
    apiKey,
    prompt,
    model,
    baseURL,
}: {
    apiKey: string
    prompt: string
    model: string
    baseURL: string
}) => {
    return await fetch(baseURL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            provider: {
                data_collection: 'deny',
            },
        }),
    })
}
