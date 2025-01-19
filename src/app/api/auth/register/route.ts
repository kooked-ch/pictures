import { sendEmail } from '@/lib/mail';
import db from '@/lib/mongo';
import { AccreditationModel } from '@/models/Accreditation';
import { UserModel } from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';
import { EmailModel } from '@/models/Email';
import { generateRandomString } from '@/lib/utils';

export async function POST(req: NextRequest) {
	try {
		const { email, password, name } = await req.json();

		await db.connect();

		const user = await UserModel.findOne({ email }).exec();

		if (user) return NextResponse.json({ error: 'User already exists' }, { status: 400 });

		const defaultAccreditation = await AccreditationModel.findOne({ slug: 'den', accessLevel: 0 }).exec();
		if (!defaultAccreditation) return NextResponse.json({ error: 'Error during registration' }, { status: 500 });

		const passwordHash = bcrypt.hashSync(password, 10);

		await UserModel.create({
			email,
			id: uuid().replace(/-/g, ''),
			provider: 'credentials',
			name,
			password: passwordHash,
			verified: false,
			accreditation: defaultAccreditation._id,
		});

		const token = generateRandomString(6);

		await EmailModel.create({
			email,
			type: 'verify',
			token,
		});

		await sendEmail(email, 'verify', { token });

		return NextResponse.json({ message: 'User created' });
	} catch (error) {
		console.error('Error during registration:', error);
		return NextResponse.json({ error: 'Error during registration' }, { status: 500 });
	}
}
