import { Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import db from '../config/db.config';
import { users, admins } from '../model/schema';
import bcrypt from 'bcrypt';
import { io } from '..';
import { EVENTS } from '../sockets/events';

export async function seedUsers(req: Request, res: Response) {
  const numberOfUsers = parseInt(req.params.number, 10) || 10;

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
      status: 'offline'
    };
  });

  try {
    const usersData = await Promise.all(userPromises);
    const [result] = await db.insert(users).values(usersData).returning();
    io.emit(EVENTS.ADMIN.USER_CREATED, result);
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

export async function seedAdmins(req: Request, res: Response) {
  const numberOfAdmins = parseInt(req.params.number, 10) || 5;

  const adminPromises = Array.from({ length: numberOfAdmins }).map(async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    return {
      email: faker.internet.email(),
      password: hashedPassword,
      role: 'admin'
    };
  });

  try {
    const adminsData = await Promise.all(adminPromises);
    await db.insert(admins).values(adminsData);

    return res.status(201).json({
      message: 'Admins seeded successfully',
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error seeding admins',
      error: error.message
    });
  }
}
