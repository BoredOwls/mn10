export const env = {
    port: process.env.PORT || "8080",
    nodeEnv: process.env.NODE_ENV || "development",
    databaseUrl: process.env.DATABASE_URL!,
    github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        baseUrl: process.env.BASE_URL!,
    },
    frontend: {
        afterAuthRedirectUrl: process.env.AFTER_AUTH_REDIRECT_URL!,
    },
} as const;
