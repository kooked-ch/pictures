'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar as CalendarIcon, ChevronDown as CaretSortIcon, Check as CheckIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';
import { UserAccountData } from '@/types/settings';
import { Checkbox } from '@/components/ui/checkbox';

const languages = [
	{ label: 'English', value: 'en' },
	{ label: 'French', value: 'fr' },
	{ label: 'German', value: 'de' },
	{ label: 'Spanish', value: 'es' },
	{ label: 'Portuguese', value: 'pt' },
	{ label: 'Russian', value: 'ru' },
	{ label: 'Japanese', value: 'ja' },
	{ label: 'Korean', value: 'ko' },
	{ label: 'Chinese', value: 'zh' },
] as const;

const accountFormSchema = z.object({
	name: z
		.string()
		.min(2, {
			message: 'Name must be at least 2 characters.',
		})
		.max(30, {
			message: 'Name must not be longer than 30 characters.',
		}),
	birthday: z.date({
		required_error: 'A date of birth is required.',
	}),
	language: z.string({
		required_error: 'Please select a language.',
	}),
	nameDisplay: z.boolean(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<AccountFormValues> = {
	// name: "Your name",
	// birthday: new Date("2023-01-23"),
	// nameDisplay: false,
};

export function AccountForm({ userData }: { userData: UserAccountData }) {
	const form = useForm<AccountFormValues>({
		resolver: zodResolver(accountFormSchema),
		defaultValues: userData,
	});

	function onSubmit(data: AccountFormValues) {
		toast({
			title: 'You submitted the following values:',
			description: (
				<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
					<code className="text-white">{JSON.stringify(data, null, 2)}</code>
				</pre>
			),
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input placeholder="Your name" {...field} />
							</FormControl>
							<FormDescription>This is the name that will be {form.watch('nameDisplay') ? 'used in your publication' : 'hidden from public view'}.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="nameDisplay"
					render={({ field }) => (
						<FormItem>
							<div className="flex flex-row items-center space-x-1">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={(checked) => {
											field.onChange(checked); // Update the form state with the new checked value
										}}
									/>
								</FormControl>
								<FormLabel className="font-normal">Use name</FormLabel>
							</div>
							<FormDescription>If checked, this name will be used as your display name instead of your username.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="birthday"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Date of birth</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button variant={'outline'} className={cn('w-[240px] pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
											{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date('1900-01-01')} initialFocus />
								</PopoverContent>
							</Popover>
							<FormDescription>Your date of birth is used to calculate your age.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="language"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Language</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button variant="outline" role="combobox" className={cn('w-[200px] justify-between', !field.value && 'text-muted-foreground')}>
											{field.value ? languages.find((language) => language.value === field.value)?.label : 'Select language'}
											<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-[200px] p-0">
									<Command>
										<CommandInput placeholder="Search language..." />
										<CommandEmpty>No language found.</CommandEmpty>
										<CommandList>
											<CommandGroup>
												{languages.map((language) => (
													<CommandItem
														value={language.label}
														key={language.value}
														onSelect={() => {
															form.setValue('language', language.value);
														}}>
														<CheckIcon className={cn('mr-2 h-4 w-4', language.value === field.value ? 'opacity-100' : 'opacity-0')} />
														{language.label}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
							<FormDescription>This is the language that will be used in the dashboard.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Update account</Button>
			</form>
		</Form>
	);
}
