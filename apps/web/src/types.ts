export type User = {
  login: string;
  name: string;
  hue: number;
};

export type Label = {
  name: string;
  color: string;
};

export type Repo = {
  name: string;
  description: string;
  lang: string;
  langColor: string;
};

export type Comment = {
  id: string;
  author: string;
  body: string;
  at: number;
};

export type ItemKind = "issue" | "pr";

export type ItemState = "open" | "closed" | "merged" | "draft";

export type ChecksStatus = "passing" | "failing" | "pending";

export type Item = {
  id: string;
  repo: string;
  number: number;
  kind: ItemKind;
  state: ItemState;
  title: string;
  body: string;
  author: string;
  assignee?: string;
  labels: string[];
  at: number;
  comments: Comment[];
  branch?: string;
  checks?: ChecksStatus;
  additions?: number;
  deletions?: number;
};
