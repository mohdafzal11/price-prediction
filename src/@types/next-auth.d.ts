import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: {
			id: string;
			email: string;
			username: string;
			displayName?: string;
			image?: string | null;
		} & DefaultSession["user"];
	}

	interface User {
		id: string;
		email: string;
		username: string;
		displayName?: string;
		image?: string | null;
	}
}
