// @ts-check

/**
 * @typedef {import("@octokit/rest").Octokit} OctokitClient
 * @link https://octokit.github.io/rest.js/v20#usage
 */

/** @typedef {import("@actions/github").context} WorkflowRunContext */

/** @type {(arg: { github: { rest: OctokitClient }, context: WorkflowRunContext }) => Promise<void>} */
module.exports = async ({ github, context }) => {
  const sha = context.payload.workflow_run?.head_sha || context.sha;
  const statusContext = process.env.STATUS_CONTEXT;
  const checks = await github.rest.checks.listForRef({
    ref: context.payload.workflow_run.head_branch,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });
  const allRuns = checks.data.check_runs;
  console.log(allRuns, { depth: null });
  const notCompletedRuns = allRuns.filter(
    (suite) => suite.status !== "completed"
  );

  switch (context.eventName) {
    case "pull_request_review": {
      if (allRuns.length === 0) {
        console.log(
          "No runs found, assuming CI is skipped with commit comment"
        );

        await github.rest.repos.createCommitStatus({
          owner: context.repo.owner,
          repo: context.repo.repo,
          sha,
          context: statusContext,
          state:
            context.payload.review.state === "approved" ? "success" : "failure",
        });
      }
      return;
    }
    case "workflow_run": {
      if (notCompletedRuns.length === 0) {
        await github.rest.repos.createCommitStatus({
          owner: context.repo.owner,
          repo: context.repo.repo,
          sha,
          context: statusContext,
          state: checks.data.check_runs.every(
            (suite) => suite.conclusion === "success"
          )
            ? "success"
            : "failure",
        });
      } else {
        console.log("Not all runs are completed");
        console.log(notCompletedRuns.map((s) => s.url));
      }
      return;
    }
  }
};
