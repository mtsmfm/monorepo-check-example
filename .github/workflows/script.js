// @ts-check

/**
 * @typedef {import("@octokit/rest").Octokit} OctokitClient
 * @link https://octokit.github.io/rest.js/v20#usage
 */

/** @typedef {import("@actions/github").context} WorkflowRunContext */

/** @type {(arg: { github: { rest: OctokitClient }, context: WorkflowRunContext }) => Promise<void>} */
module.exports = async ({ github, context }) => {
  const result = await github.rest.checks.listSuitesForRef({
    ref: context.ref,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });
  console.dir(result, { depth: null });
};
