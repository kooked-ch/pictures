import TwoFactorVerify from '@/components/auth/two-factor/verify';
import { getTwoFactor } from '@/lib/factor';
import { redirect, useSearchParams } from 'next/navigation';

export default async function VerifyPage({ params, searchParams }: { params: { slug: string }; searchParams?: { [key: string]: string | string[] | undefined } }) {
	const { enabled } = await getTwoFactor();

	const redirectPath = searchParams?.callbackUrl as string | undefined;

	if (!enabled) {
		redirect(`/enable?callbackUrl=${encodeURIComponent(redirectPath || '/')}`);
	}

	return <TwoFactorVerify />;
}
