# AI Code Review Action

This action uses AI to review code and leave a review on the PR.

## Usage

```
# example workflow for ai code review
name: Ai Code Review
on:
  pull_request:
    types: [opened, ready_for_review, review_requested]

jobs:
  ai-review:
    if: |
      github.event.pull_request.draft == false &&
      (github.event.action == 'opened') ||
      (github.event.action == 'review_requested' && github.event.requested_reviewer.login == '<automation-github-username>')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          # Checkout pull request branch instead of merge commit
          ref: ${{ github.event.pull_request.head.ref }}
          fetch-depth: 0

      # - uses: ./.github/actions/review
      - uses: maxmoshe/ai-review@main
        with:
          githubToken: ${{ secrets.GITHUB_KEY }}
          model: anthropic/claude-3.5-haiku #deepseek/deepseek-r1 #deepseek/deepseek-r1-distill-llama-8b
          openAiApiKey: ${{ secrets.OPENROUTER_KEY }}
          exclude: .*\.js, .*\.js\.map, yarn.lock
          pullNumber: ${{ github.event.pull_request.number }}
          maxLines: 600
```

## Inputs

- `githubToken`: The GitHub token to use to leave a review.
- `model`: The model to use to review the code.
- `openAiApiKey`: The OpenAI API key to use to review the code.
- `exclude`: Regex patterns to exclude from review.
- `pullNumber`: The pull request number to review.
- `maxLines`: The maximum number of lines to review.
- `updateReview`: Whether to update the review if it already exists. If false, create a new additional review.
