import NextAuth, { NextAuthOptions, User, Session } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { v4 as uuid } from 'uuid';
import db from '@/lib/mongo';
import { IUser, UserModel } from '@/models/User';
import { AccreditationModel, IAccreditation } from '@/models/Accreditation';
import { JWT } from 'next-auth/jwt';
import { getServerSession } from 'next-auth/next';
import { cookies } from 'next/headers';
import { checkTwoFactor, getTwoFactor } from './factor';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryt from 'bcrypt';
import rateLimit from './rate-limit';

const limiter = rateLimit({
	interval: 60 * 1000,
	uniqueTokenPerInterval: 500,
});

const getProviders = () => [
	GitHubProvider({
		clientId: process.env.GITHUB_ID!,
		clientSecret: process.env.GITHUB_SECRET!,
		allowDangerousEmailAccountLinking: true,
	}),
	GoogleProvider({
		clientId: process.env.GOOGLE_ID!,
		clientSecret: process.env.GOOGLE_SECRET!,
		allowDangerousEmailAccountLinking: true,
	}),
	CredentialsProvider({
		name: 'Credentials',
		credentials: {
			email: { label: 'Email', type: 'email' },
			password: { label: 'Password', type: 'password' },
		},
		async authorize(credentials, req) {
			try {
				if (!credentials) return null;

				const ip = req?.headers?.['x-forwarded-for'] || '127.0.0.1';
				const { isRateLimited } = limiter.check(5, `login_${ip}`);
				if (isRateLimited) {
					throw new Error('Too many login attempts. Please try again later.');
				}

				await db.connect();

				const user = await UserModel.findOne<IUser>({ email: credentials.email }, 'email password verified username name _id').lean();

				if (!user || !user.verified) {
					await new Promise((r) => setTimeout(r, 1000));
					return null;
				}

				const isValid = await bcryt.compare(credentials.password, user.password);
				if (!isValid) {
					await new Promise((r) => setTimeout(r, 1000));
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					username: user.username,
					name: user.name,
				};
			} catch (error) {
				console.error('Auth error:', error);
				throw new Error('An error occurred');
			}
		},
	}),
];

export const enhanceToken = async ({ token, user }: { token: JWT; user: User }): Promise<JWT> => {
	try {
		if (user) {
			token.twoFactorComplete = user.twoFactorComplete ?? false;
		}
		return token;
	} catch (error) {
		console.error('Token enhancement error:', error);
		token.twoFactorComplete = false;
		return token;
	}
};

export const handleSignIn = async ({ user, account, profile }: { user: User; account: any; profile?: any }): Promise<boolean> => {
	try {
		await db.connect();
		const email = user.email;
		if (!email) return false;

		const provider = account?.provider ?? 'credentials';

		const defaultAccreditation = await AccreditationModel.findOne<IAccreditation>({ slug: 'den', accessLevel: 0 }).exec();

		if (!defaultAccreditation) return false;

		const existingUser = await UserModel.findOne({ email }).exec();

		if (existingUser) {
			const updates = {
				username: profile?.name ?? profile?.login ?? existingUser.username,
				image: user.image ?? profile?.image ?? existingUser.image,
				name: profile?.name ?? user.name ?? profile?.login ?? existingUser.name,
			};

			await UserModel.updateOne({ _id: existingUser._id }, updates);
		} else {
			const newUser = await UserModel.create({
				email,
				id: uuid().replace(/-/g, ''),
				username: profile?.name ?? profile?.login ?? null,
				image: user.image ?? profile?.image ?? null,
				provider,
				name: profile?.name ?? user.name ?? profile?.login ?? null,
				verified: ['google', 'github'].includes(provider),
				accreditation: defaultAccreditation._id,
			});
		}

		return true;
	} catch (error) {
		console.error('Sign-in error:', error);
		return false;
	}
};

export const getUser = async (): Promise<User | null> => {
	const session = await getServerSession();

	const userCookies = await cookies();

	const token = userCookies.get(process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token');
	if (!token) return null;

	if (!(await checkTwoFactor(token))) return null;

	await db.connect();
	const user = await UserModel.findOne<IUser>({ email: session?.user?.email }).populate<{ accreditation: IAccreditation }>('accreditation', '-slug -accessLevel').exec();

	return {
		email: session?.user?.email ?? '',
		name: user?.name ?? '',
		id: user?._id.toString() ?? '',
		username: user?.username ?? '',
		image: user?.image ?? '',
	};
};

export const authOptions: NextAuthOptions = {
	pages: {
		signIn: '/login',
		verifyRequest: '/login',
		error: '/login',
	},
	providers: getProviders(),
	session: {
		strategy: 'jwt',
		maxAge: 7 * 24 * 60 * 60, // 7 days
	},
	callbacks: {
		jwt: enhanceToken,
		signIn: handleSignIn,
	},
	events: {
		signIn: async ({ user, account }) => {
			await db.connect();
			await UserModel.updateOne({ email: user.email }, { lastLogin: new Date() });
		},
	},
};

export default NextAuth(authOptions);
