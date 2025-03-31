// @ts-check

/**
 * @typedef {import("@octokit/rest").Octokit} OctokitClient
 * @link https://octokit.github.io/rest.js/v20#usage
 */

/** @typedef {import("@actions/github").context} WorkflowRunContext */

/** @type {(arg: { github: { rest: OctokitClient }, context: WorkflowRunContext }) => Promise<void>} */
module.exports = async ({ github, context }) => {
  const listSuites = await github.rest.checks.listSuitesForRef({
    ref: context.payload.workflow_run.head_branch,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  if (
    listSuites.data.check_suites.every((suite) => suite.status === "completed")
  ) {
    const sha = context.payload.workflow_run.head_sha;

    await github.rest.checks.create({
      head_sha: sha,
      owner: context.repo.owner,
      repo: context.repo.repo,
      name: "CI status",
      status: "completed",
      conclusion: listSuites.data.check_suites.every(
        (suite) => suite.conclusion === "success"
      )
        ? "success"
        : "failure",
    });
  }
};
