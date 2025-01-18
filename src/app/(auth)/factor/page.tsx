import TwoFactorVerify from '@/components/auth/two-factor/verify';
import { getTwoFactor } from '@/lib/factor';
import { redirect } from 'next/navigation';

interface PageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerifyPage({ searchParams }: PageProps) {
	const { enabled } = await getTwoFactor();
	const redirectPath = (await searchParams)?.callbackUrl as string | undefined;

	if (!enabled) {
		redirect(`/enable?callbackUrl=${encodeURIComponent(redirectPath || '/')}`);
	}

	return <TwoFactorVerify />;
}
