import TwoFactorVerify from '@/components/auth/two-factor/verify';
import { getTwoFactor } from '@/lib/factor';
import { redirect } from 'next/navigation';

interface PageProps {
	params: Record<string, never>;
	searchParams?: {
		callbackUrl?: string;
		[key: string]: string | string[] | undefined;
	};
}

export default async function VerifyPage({ params, searchParams }: PageProps) {
	const { enabled } = await getTwoFactor();
	const redirectPath = searchParams?.callbackUrl as string | undefined;

	if (!enabled) {
		redirect(`/enable?callbackUrl=${encodeURIComponent(redirectPath || '/')}`);
	}

	return <TwoFactorVerify />;
}
