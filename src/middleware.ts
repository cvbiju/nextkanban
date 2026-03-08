import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized({ req, token }) {
            // Return true if the user is logged in, false otherwise
            return !!token;
        },
    },
});

export const config = {
    // Matches all routes except APIs, login, register, and static files
    matcher: ['/((?!api/|login|register|_next/static|_next/image|favicon.ico).*)'],
};
