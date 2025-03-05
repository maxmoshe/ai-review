# AI Code Review Action

This action uses AI to review code and leave a review on the PR.

## Requirements
- OpenRouter API key
- GitHub token

## Usage
Example workflow:
`.github/workflows/ai-review.yml`
```yaml
name: Ai Code Review
on:
  pull_request:
    types: [opened, ready_for_review, review_requested]

jobs:
  ai-review:
    if: |
      github.event.pull_request.draft == false &&
      (github.event.action == 'opened') ||
      (github.event.action == 'ready_for_review') ||
      (github.event.action == 'review_requested' && github.event.requested_reviewer.login == '<automation-github-username>')
    runs-on: ubuntu-latest
    steps:
      # - uses: ./.github/actions/review
      - uses: maxmoshe/ai-review@main
        with:
          githubToken: ${{ secrets.GITHUB_KEY }}
          model: anthropic/claude-3.5-haiku #deepseek/deepseek-r1 #deepseek/deepseek-r1-distill-llama-8b
          openAiApiKey: ${{ secrets.OPENROUTER_KEY }}
          exclude: .*\.js, .*\.js\.map, yarn.lock
          pullNumber: ${{ github.event.pull_request.number }}
          maxLines: 600
          prompt: |
            You are a code reviewer. You are given a diff of a pull request.
            Provide feedback only on clear significant issues you are absolutely confident about. You can use markdown.
            Provide the file containing the issue, so it's easy to find.
            If you are not sure, do not provide feedback.
            Be brief and concise.
            Commenting on needless console.logs is ok.
```
Triggers can be changed to suit your needs. For example if you have no automation user, you may want to trigger on `/review` comment.
```yaml
    if: |
      github.event.pull_request.draft == false &&
      (github.event.action == 'opened') ||
      (github.event.action == 'ready_for_review') ||
      (github.event.issue.pull_request && github.event.comment.body == '/review')
```

## Inputs

- `prompt`: The prompt to use to review the code.
- `githubToken`: The GitHub token to use to leave a review.
- `model`: The model to use to review the code.
- `openAiApiKey`: The OpenAI API key to use to review the code.
- `exclude`: Regex patterns to exclude from review.
- `pullNumber`: The pull request number to review.
- `maxLines`: The maximum number of lines to review.
- `updateReview`: Whether to update the review if it already exists. If false, create a new additional review.
- `allowDataCollection`: Whether to allow data collection. False by default, if you want to use a free model or cut costs, you may want to set this to true.