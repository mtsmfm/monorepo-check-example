// @ts-check

/**
 * @typedef {import("@octokit/rest").Octokit} OctokitClient
 * @link https://octokit.github.io/rest.js/v20#usage
 */

/** @typedef {import("@actions/github").context} WorkflowRunContext */

/** @type {(arg: { github: { rest: OctokitClient }, context: WorkflowRunContext }) => Promise<void>} */
module.exports = async ({ github, context }) => {
  const checks = await github.rest.checks.listForRef({
    ref: context.payload.workflow_run.head_branch,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  const notCompletedRuns = checks.data.check_runs.filter(
    (suite) => suite.status !== "completed"
  );

  if (notCompletedRuns.length === 0) {
    const sha = context.payload.workflow_run.head_sha;

    await github.rest.repos.createCommitStatus({
      owner: context.repo.owner,
      repo: context.repo.repo,
      sha,
      context: "foo bar",
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
};
