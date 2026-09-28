# Android App Workflow Lessons

Use this checklist when RentalVerifyAI Android development begins.

## What went wrong on PR #71

- Development and testing were completed in a temporary workspace before GitHub terminal credentials were verified.
- The final fix existed only in a local commit, so saying the work was finished would have been premature.
- The terminal push failed because the workspace had no authenticated GitHub credentials.

## Correction

1. Verify repository read and write access before editing Android code.
2. Confirm the correct branch and a clean working tree.
3. Make the change and run the relevant tests, lint, and production build.
4. Commit the verified change.
5. Push immediately through an authenticated GitHub connection.
6. Confirm the remote branch contains the new commit SHA.
7. Check GitHub CI and deployment status before reporting completion or merging.

## Completion rule

Android work is not complete merely because it passes locally. It is complete only after the commit is visible on GitHub and required checks pass.
