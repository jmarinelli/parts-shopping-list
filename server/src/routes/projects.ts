import { Router, Request, Response } from 'express';
import * as projectsService from '../services/projects';
import * as carsService from '../services/cars';

export const projectsRouter = Router();

projectsRouter.get(
  '/cars/:carId/projects',
  async (req: Request<{ carId: string }>, res: Response) => {
    const car = await carsService.getCarById(req.params.carId);
    if (!car) {
      res.status(404).json({ error: { message: 'Car not found' } });
      return;
    }
    const projects = await projectsService.listProjectsByCarId(req.params.carId);
    res.json({ data: projects });
  },
);

projectsRouter.post(
  '/cars/:carId/projects',
  async (req: Request<{ carId: string }>, res: Response) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res
        .status(400)
        .json({ error: { message: 'Name is required and must be a non-empty string' } });
      return;
    }
    const car = await carsService.getCarById(req.params.carId);
    if (!car) {
      res.status(404).json({ error: { message: 'Car not found' } });
      return;
    }
    const project = await projectsService.createProject(
      req.params.carId,
      name.trim(),
    );
    res.status(201).json({ data: project });
  },
);

projectsRouter.get(
  '/projects/:projectId',
  async (req: Request<{ projectId: string }>, res: Response) => {
    const project = await projectsService.getProjectById(req.params.projectId);
    if (!project) {
      res.status(404).json({ error: { message: 'Project not found' } });
      return;
    }
    res.json({ data: project });
  },
);

projectsRouter.put(
  '/projects/:projectId',
  async (req: Request<{ projectId: string }>, res: Response) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res
        .status(400)
        .json({ error: { message: 'Name is required and must be a non-empty string' } });
      return;
    }
    const project = await projectsService.updateProject(
      req.params.projectId,
      name.trim(),
    );
    if (!project) {
      res.status(404).json({ error: { message: 'Project not found' } });
      return;
    }
    res.json({ data: project });
  },
);

projectsRouter.delete(
  '/projects/:projectId',
  async (req: Request<{ projectId: string }>, res: Response) => {
    const project = await projectsService.deleteProject(req.params.projectId);
    if (!project) {
      res.status(404).json({ error: { message: 'Project not found' } });
      return;
    }
    res.json({ data: { id: project.id } });
  },
);
