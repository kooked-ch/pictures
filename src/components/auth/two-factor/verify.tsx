'use client';
import { SetStateAction, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function TwoFactorVerify() {
	const [error, setError] = useState<string | null>(null);
	const [otp, setOtp] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const searchParams = useSearchParams();
	const router = useRouter();
	const redirectPath = searchParams.get('callbackUrl') ?? '/';

	async function submit() {
		try {
			setIsLoading(true);
			const response = await fetch(`/api/auth/factor/verify`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ otp }),
			});

			if (response.ok) {
				router.push(redirectPath);
				return;
			}

			const body = await response.json();
			setError(body.error || 'An unexpected error occurred. Please try again later.');
		} catch (e) {
			setError('An unexpected error occurred. Please try again later.');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="h-svh flex items-center justify-center p-4">
			<div className="w-full max-w-md space-y-8">
				<Link href="/" className="flex gap-3 justify-center items-center group">
					<Camera className="size-9" />
					<h1 className="text-4xl font-black">Pictures</h1>
				</Link>

				<Card className="shadow-lg border-accent md:border border-0">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-bold tracking-tight">Security check</CardTitle>
						<CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
					</CardHeader>

					<CardContent className="space-y-2 flex items-center justify-center flex-col">
						{error && (
							<Alert variant="destructive" className="w-full bg-red-500 bg-opacity-10">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
						<div className="space-y-4">
							<InputOTP maxLength={6} value={otp} onChange={(value: SetStateAction<string>) => setOtp(value)} className="justify-center gap-2">
								<InputOTPGroup>
									<InputOTPSlot index={0} />
									<InputOTPSlot index={1} />
									<InputOTPSlot index={2} />
									<InputOTPSlot index={3} />
									<InputOTPSlot index={4} />
									<InputOTPSlot index={5} />
								</InputOTPGroup>
							</InputOTP>
						</div>
					</CardContent>

					<CardFooter>
						<Button className="w-full flex gap-1" onClick={submit} disabled={isLoading || otp.length !== 6}>
							{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
							Verify
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
