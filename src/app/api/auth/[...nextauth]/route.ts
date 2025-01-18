import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest, context: any) {
	return await NextAuth(req, context, authOptions);
}

export async function POST(req: NextRequest, context: any) {
	return await NextAuth(req, context, authOptions);
}
