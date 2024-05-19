import { Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import db from '../config/db.config';
import { users } from '../model/schema'; // Ensure this points to your actual schema file
import bcrypt from 'bcrypt';

export async function seedUsers(req: Request, res: Response) {
  const numberOfUsers = parseInt(req.params.number, 10) || 10; // Default to 10 if no number is provided

  const userPromises = Array.from({ length: numberOfUsers }).map(async () => {
    const hashedPassword = await bcrypt.hash('pass123', 10);
    return {
      username: faker.internet.userName(),
      phone_number: faker.phone.number(),
      email: faker.internet.email(),
      password: hashedPassword,
      profile_picture_url: faker.image.avatar(),
      status_message: faker.lorem.sentence(),
      last_seen: faker.date.recent(),
      is_online: faker.datatype.boolean()
    };
  });

  try {
    const usersData = await Promise.all(userPromises);
    await db.insert(users).values(usersData);

    return res.status(201).json({
      message: 'Users seeded successfully',
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error seeding users',
      error: error.message
    });
  }
}
