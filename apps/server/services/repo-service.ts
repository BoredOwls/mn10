import { InternalError } from "../common/api-error";
import type { ListIssueFilters, ListPrFilters } from "../types/repo-types";

const GITHUB_API = "https://api.github.com";

const githubFetch = async (token: string, path: string, params?: Record<string, string>) => {
    const url = new URL(`${GITHUB_API}${path}`);
    if (params) {
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const res = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "mn10-app",
        },
    });

    if (!res.ok) throw new InternalError(`github_api_error: ${res.status}`);
    return res.json();
};

const getRepos = async (token: string, limit: Number = 100) => {
    return githubFetch(token, "/user/repos", { per_page: String(limit) });
};


const getReposByOwner = async (token: string, owner: string) => {
    return githubFetch(token, `/users/${owner}/repos`, { per_page: "100" });
};


const getIssues = async (token: string, owner: string, repo: string, filters: ListIssueFilters) => {
    const params: Record<string, string> = { per_page: "100" };
    if (filters.state)    params.state    = filters.state;
    if (filters.assignee) params.assignee = filters.assignee;
    if (filters.creator)  params.creator  = filters.creator;
    if (filters.labels)   params.labels   = filters.labels;

    return githubFetch(token, `/repos/${owner}/${repo}/issues`, params);
};

const getIssue = async (token: string, owner: string, repo: string, issueNumber: string) => {
    return githubFetch(token, `/repos/${owner}/${repo}/issues/${issueNumber}`);
};

const getIssueComments = async (token: string, owner: string, repo: string, issueNumber: string) => {
    return githubFetch(token, `/repos/${owner}/${repo}/issues/${issueNumber}/comments`);
};

const getPrs = async (token: string, owner: string, repo: string, filters: ListPrFilters) => {
    const params: Record<string, string> = { per_page: "100" };
    if (filters.state) params.state = filters.state;
    if (filters.head)  params.head  = filters.head;
    if (filters.base)  params.base  = filters.base;

    return githubFetch(token, `/repos/${owner}/${repo}/pulls`, params);
};

const getPr = async (token: string, owner: string, repo: string, prNumber: string) => {
    return githubFetch(token, `/repos/${owner}/${repo}/pulls/${prNumber}`);
};

const getPrComments = async (token: string, owner: string, repo: string, prNumber: string) => {
    return githubFetch(token, `/repos/${owner}/${repo}/pulls/${prNumber}/comments`);
};

export const RepoService = {
    getRepos,
	getReposByOwner,
    getIssues,
    getIssue,
    getIssueComments,
    getPrs,
    getPr,
    getPrComments,
};
