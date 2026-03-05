import { Router, Request, Response } from 'express';
import * as partsService from '../services/parts';
import * as projectsService from '../services/projects';

export const partsRouter = Router();

partsRouter.get(
  '/projects/:projectId/parts',
  async (req: Request<{ projectId: string }>, res: Response) => {
    const project = await projectsService.getProjectById(req.params.projectId);
    if (!project) {
      res.status(404).json({ error: { message: 'Project not found' } });
      return;
    }
    const parts = await partsService.listPartsByProjectId(
      req.params.projectId,
    );
    res.json({ data: parts });
  },
);

partsRouter.post(
  '/projects/:projectId/parts',
  async (req: Request<{ projectId: string }>, res: Response) => {
    const { name, status, isOptional } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({
        error: { message: 'Name is required and must be a non-empty string' },
      });
      return;
    }
    if (status !== undefined && !['pending', 'ordered', 'owned'].includes(status)) {
      res.status(400).json({
        error: { message: 'Status must be one of: pending, ordered, owned' },
      });
      return;
    }
    const project = await projectsService.getProjectById(req.params.projectId);
    if (!project) {
      res.status(404).json({ error: { message: 'Project not found' } });
      return;
    }
    const part = await partsService.createPart(req.params.projectId, {
      name: name.trim(),
      status,
      isOptional,
    });
    res.status(201).json({ data: part });
  },
);

partsRouter.get('/parts/:partId', async (req: Request<{ partId: string }>, res: Response) => {
  const part = await partsService.getPartWithOptions(req.params.partId);
  if (!part) {
    res.status(404).json({ error: { message: 'Part not found' } });
    return;
  }
  res.json({ data: part });
});

partsRouter.put('/parts/:partId', async (req: Request<{ partId: string }>, res: Response) => {
  const { name, status, isOptional } = req.body;
  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    res.status(400).json({
      error: { message: 'Name must be a non-empty string' },
    });
    return;
  }
  if (status !== undefined && !['pending', 'ordered', 'owned'].includes(status)) {
    res.status(400).json({
      error: { message: 'Status must be one of: pending, ordered, owned' },
    });
    return;
  }
  const data: { name?: string; status?: string; isOptional?: boolean } = {};
  if (name !== undefined) data.name = name.trim();
  if (status !== undefined) data.status = status;
  if (isOptional !== undefined) data.isOptional = isOptional;

  const part = await partsService.updatePart(req.params.partId, data);
  if (!part) {
    res.status(404).json({ error: { message: 'Part not found' } });
    return;
  }
  res.json({ data: part });
});

partsRouter.delete('/parts/:partId', async (req: Request<{ partId: string }>, res: Response) => {
  const part = await partsService.deletePart(req.params.partId);
  if (!part) {
    res.status(404).json({ error: { message: 'Part not found' } });
    return;
  }
  res.json({ data: { id: part.id } });
});

partsRouter.patch(
  '/projects/:projectId/parts/reorder',
  async (req: Request<{ projectId: string }>, res: Response) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      res.status(400).json({
        error: { message: 'orderedIds must be a non-empty array' },
      });
      return;
    }
    const project = await projectsService.getProjectById(req.params.projectId);
    if (!project) {
      res.status(404).json({ error: { message: 'Project not found' } });
      return;
    }
    const parts = await partsService.reorderParts(
      req.params.projectId,
      orderedIds,
    );
    res.json({ data: parts });
  },
);
