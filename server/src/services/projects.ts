import { eq } from 'drizzle-orm';
import { db } from '../db';
import { projects } from '../db/schema/projects';

export async function listProjectsByCarId(carId: string) {
  return db
    .select()
    .from(projects)
    .where(eq(projects.carId, carId))
    .orderBy(projects.createdAt);
}

export async function getProjectById(id: string) {
  const results = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));
  return results[0] ?? null;
}

export async function createProject(carId: string, name: string) {
  const results = await db
    .insert(projects)
    .values({ carId, name })
    .returning();
  return results[0];
}

export async function updateProject(id: string, name: string) {
  const results = await db
    .update(projects)
    .set({ name, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return results[0] ?? null;
}

export async function deleteProject(id: string) {
  const results = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning({ id: projects.id });
  return results[0] ?? null;
}
