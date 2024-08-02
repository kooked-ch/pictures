import Link from 'next/link';

export default function Verified() {
	return (
		<div className="flex flex-col items-center justify-center h-[90vh] px-4 md:px-6 py-12 md:py-24 lg:py-32 text-center">
			<div className="max-w-md space-y-4">
				<p className="text-lg text-gray-500 dark:text-gray-400">Don't worry, your account is currently under review.</p>
				<Link href="/" className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-6 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300" prefetch={false}>
					Return Home
				</Link>
			</div>
		</div>
	);
}
