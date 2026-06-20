
export interface ListIssueFilters {
    state?:    "open" | "closed" | "all";
    labels?:   string;
    assignee?: string;
    creator?:  string;
}

export interface ListPrFilters {
    state?: "open" | "closed" | "all";
    head?:  string;
    base?:  string;
}
