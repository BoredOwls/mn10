export interface GithubUser {
    id: number;
    login: string;
    email: string | null;
    avatar_url: string;
}

export interface GithubEmail {
    email: string;
    primary: boolean;
    verified: boolean;
}

export interface GithubTokenResponse {
    access_token?: string;
    token_type?: string;
    scope?: string;
    error?: string;
    error_description?: string;
}


interface GithubOrgMembership_OrgInfo {
	login: string;
	id: number
}
export interface GithubOrgMembership {
    state: "active" | "pending";
    role: "admin" | "member";
	organization: GithubOrgMembership_OrgInfo
}

export interface GithubOrgBrief {
	id: number;
	name: string;
	state: "active" | "pending";
    role: "admin" | "member";
}

export interface GithubOrgRole {
	role: "admin" | "member" | null;
}
