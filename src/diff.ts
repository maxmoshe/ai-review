import parseDiff from 'parse-diff'

export const filterDiff = (diff: parseDiff.File[], excludePatterns: string[]) => {
    // exclude files that match any of the patterns
    const filteredDiff = diff.filter((file) => {
        return !excludePatterns.some((pattern) => {
            const regex = new RegExp(pattern)
            return regex.test(file.to ?? '')
        })
    })

    // filter out deleted files
    return filteredDiff.filter((file) => file.to !== '/dev/null')
}
