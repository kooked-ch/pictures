import { readFileSync } from 'fs';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import path from 'path';

export async function sendEmail(email: string, type: string, data?: any): Promise<void> {
	let htmlContent: string | undefined;

	switch (type) {
		case 'verify':
			htmlContent = getTemplateContent('./templates/verify.html', data);
			await send(email, 'Verify your email address', htmlContent);
			break;

		default:
			console.warn(`Unknown email type: ${type}`);
			break;
	}
}

function getTemplateContent(templatePath: string, data?: any): string {
	let htmlContent = readFileSync(path.resolve(templatePath), 'utf8');
	const placeholders = {
		'{verification_code}': data?.token,
	};

	for (const [placeholder, value] of Object.entries(placeholders)) {
		htmlContent = htmlContent.replaceAll(placeholder, value);
	}

	return htmlContent;
}

async function send(email: string, subject: string, htmlContent: string): Promise<void> {
	const transporter: Transporter = nodemailer.createTransport({
		host: 'mail.infomaniak.com',
		port: 465,
		secure: true,
		auth: {
			user: process.env.MAIL_USER || '',
			pass: process.env.MAIL_PASSWORD || '',
		},
	});

	const mailOptions: SendMailOptions = {
		from: `"Kooked Pictures" <${process.env.MAIL_USER || ''}>`,
		to: email,
		subject,
		html: htmlContent,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.info('E-mail sent:', info.response);
	} catch (error) {
		console.error('Error sending email:', error);
	}
}
