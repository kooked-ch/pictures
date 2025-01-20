import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { SessionProvider } from '@/components/session-provider';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Pictures',
	description: 'A simple photo gallery application.',
	keywords: ['pictures', 'images', 'photos', 'gallery', 'albums', 'memories'],
	applicationName: 'Kooked Pictures',
};

type RootLayoutProps = any;

export default function RootLayout(props: RootLayoutProps) {
	const { children, session } = props;
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body className={inter.className}>
				<SessionProvider session={session}>{children}</SessionProvider>
			</body>
		</html>
	);
}
