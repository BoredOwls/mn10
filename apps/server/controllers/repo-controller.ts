
import type { Request, Response } from "express";
import { asyncHandler } from "../common/async-handler";
import { ApiResponse } from "../common/api-response";
import { BadRequestError } from "../common/api-error";
import { RepoService } from "../services/repo-service";
import type { ListIssueFilters, ListPrFilters } from "../types/repo-types";

const getRepos = async (req: Request, res: Response) => {
    const repos = await RepoService.getRepos(req.githubToken!);
    res.json(ApiResponse.ok("ok", repos));
};


const getReposByOwner = async (req: Request, res: Response) => {
    const repos = await RepoService.getReposByOwner(req.githubToken!, req.params.owner);
    res.json(ApiResponse.ok("ok", repos));
};


const getIssues = async (req: Request, res: Response) => {
    const { owner, repo } = req.params;
    const { state, labels, assignee, creator } = req.query;

    if (state && state !== "open" && state !== "closed" && state !== "all") {
        throw new BadRequestError("invalid_issue_state");
    }

    const filters: ListIssueFilters = {
        ...(state    && { state:    state    as ListIssueFilters["state"] }),
        ...(labels   && { labels:   String(labels) }),
        ...(assignee && { assignee: String(assignee) }),
        ...(creator  && { creator:  String(creator) }),
    };

    const issues = await RepoService.getIssues(req.githubToken!, owner, repo, filters);
    res.json(ApiResponse.ok("ok", issues));
};

const getIssue = async (req: Request, res: Response) => {
    const { owner, repo, issueNumber } = req.params;
    const issue = await RepoService.getIssue(req.githubToken!, owner, repo, issueNumber);
    res.json(ApiResponse.ok("ok", issue));
};

const getIssueComments = async (req: Request, res: Response) => {
    const { owner, repo, issueNumber } = req.params;
    const comments = await RepoService.getIssueComments(req.githubToken!, owner, repo, issueNumber);
    res.json(ApiResponse.ok("ok", comments));
};

const getPrs = async (req: Request, res: Response) => {
    const { owner, repo } = req.params;
    const { state, head, base } = req.query;

    if (state && state !== "open" && state !== "closed" && state !== "all") {
        throw new BadRequestError("invalid_pr_state");
    }

    const filters: ListPrFilters = {
        ...(state && { state: state as ListPrFilters["state"] }),
        ...(head  && { head:  String(head) }),
        ...(base  && { base:  String(base) }),
    };

    const prs = await RepoService.getPrs(req.githubToken!, owner, repo, filters);
    res.json(ApiResponse.ok("ok", prs));
};

const getPr = async (req: Request, res: Response) => {
    const { owner, repo, prNumber } = req.params;
    const pr = await RepoService.getPr(req.githubToken!, owner, repo, prNumber);
    res.json(ApiResponse.ok("ok", pr));
};

const getPrComments = async (req: Request, res: Response) => {
    const { owner, repo, prNumber } = req.params;
    const comments = await RepoService.getPrComments(req.githubToken!, owner, repo, prNumber);
    res.json(ApiResponse.ok("ok", comments));
};

export const repoController = {
    getRepos:         asyncHandler(getRepos),
	getReposByOwner:  asyncHandler(getReposByOwner),
    getIssues:        asyncHandler(getIssues),
    getIssue:         asyncHandler(getIssue),
    getIssueComments: asyncHandler(getIssueComments),
    getPrs:           asyncHandler(getPrs),
    getPr:            asyncHandler(getPr),
    getPrComments:    asyncHandler(getPrComments),
};
