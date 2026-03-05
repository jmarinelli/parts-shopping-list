import { eq } from 'drizzle-orm';
import { db } from '../db';
import { cars } from '../db/schema/cars';

export async function listCars() {
  return db.select().from(cars).orderBy(cars.createdAt);
}

export async function getCarById(id: string) {
  const results = await db.select().from(cars).where(eq(cars.id, id));
  return results[0] ?? null;
}

export async function createCar(name: string) {
  const results = await db.insert(cars).values({ name }).returning();
  return results[0];
}

export async function updateCar(id: string, name: string) {
  const results = await db
    .update(cars)
    .set({ name, updatedAt: new Date() })
    .where(eq(cars.id, id))
    .returning();
  return results[0] ?? null;
}

export async function deleteCar(id: string) {
  const results = await db
    .delete(cars)
    .where(eq(cars.id, id))
    .returning({ id: cars.id });
  return results[0] ?? null;
}
