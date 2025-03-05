import parseDiff from 'parse-diff'
import { filterDiff } from './diff'

describe('filterDiff', () => {
    it('should filter out files matching exclude patterns and deleted files', () => {
        const mockDiff: parseDiff.File[] = [
            {
                to: 'src/file1.ts',
                chunks: [],
                deletions: 0,
                additions: 0,
            },
            {
                to: 'src/test/file2.test.ts',
                chunks: [],
                deletions: 0,
                additions: 0,
            },
            {
                to: 'src/file1.js',
                chunks: [],
                deletions: 0,
                additions: 0,
            },
            {
                to: 'src/file2.ts',
                chunks: [],
                deletions: 0,
                additions: 0,
            },
            {
                to: '/dev/null', // deleted file
                chunks: [],
                deletions: 0,
                additions: 0,
            },
            {
                to: 'src/generated/schema.ts',
                chunks: [],
                deletions: 0,
                additions: 0,
            },
        ]

        const excludePatterns = ['test/', 'generated/', '.*\\.js']

        const result = filterDiff(mockDiff, excludePatterns)

        expect(result).toHaveLength(2)
        expect(result[0].to).toBe('src/file1.ts')
        expect(result[1].to).toBe('src/file2.ts')
    })
})
