import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized({ req, token }) {
            return !!token;
        },
    },
    cookies: {
        sessionToken: {
            name: `__session`,
        }
    }
});

export const config = {
    // Matches all routes except APIs, login, register, and static files
    matcher: ['/((?!api/|login|register|_next/static|_next/image|favicon.ico).*)'],
};
