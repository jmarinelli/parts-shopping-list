import { Router, Request, Response } from 'express';
import * as partGroupsService from '../services/part-groups';
import * as projectsService from '../services/projects';

export const partGroupsRouter = Router();

partGroupsRouter.get(
  '/projects/:projectId/part-groups',
  async (req: Request<{ projectId: string }>, res: Response) => {
    const project = await projectsService.getProjectById(req.params.projectId);
    if (!project) {
      res.status(404).json({ error: { message: 'Project not found' } });
      return;
    }
    const groups = await partGroupsService.listPartGroupsByProjectId(
      req.params.projectId,
    );
    res.json({ data: groups });
  },
);

partGroupsRouter.post(
  '/projects/:projectId/part-groups',
  async (req: Request<{ projectId: string }>, res: Response) => {
    const { name, isOptional } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: { message: 'Name is required' } });
      return;
    }
    const project = await projectsService.getProjectById(req.params.projectId);
    if (!project) {
      res.status(404).json({ error: { message: 'Project not found' } });
      return;
    }
    const group = await partGroupsService.createPartGroup(
      req.params.projectId,
      {
        name: name.trim(),
        isOptional,
      },
    );
    res.status(201).json({ data: group });
  },
);

partGroupsRouter.get(
  '/part-groups/:partGroupId',
  async (req: Request<{ partGroupId: string }>, res: Response) => {
    const group = await partGroupsService.getPartGroupWithOptions(
      req.params.partGroupId,
    );
    if (!group) {
      res
        .status(404)
        .json({ error: { message: 'Part group not found' } });
      return;
    }
    res.json({ data: group });
  },
);

partGroupsRouter.put(
  '/part-groups/:partGroupId',
  async (req: Request<{ partGroupId: string }>, res: Response) => {
    const { name, isOptional } = req.body;
    if (
      name !== undefined &&
      (typeof name !== 'string' || name.trim().length === 0)
    ) {
      res.status(400).json({
        error: { message: 'Name must be a non-empty string' },
      });
      return;
    }
    const data: { name?: string; isOptional?: boolean } = {};
    if (name !== undefined) data.name = name.trim();
    if (isOptional !== undefined) data.isOptional = isOptional;

    const group = await partGroupsService.updatePartGroup(
      req.params.partGroupId,
      data,
    );
    if (!group) {
      res
        .status(404)
        .json({ error: { message: 'Part group not found' } });
      return;
    }
    res.json({ data: group });
  },
);

partGroupsRouter.delete(
  '/part-groups/:partGroupId',
  async (req: Request<{ partGroupId: string }>, res: Response) => {
    const group = await partGroupsService.deletePartGroup(
      req.params.partGroupId,
    );
    if (!group) {
      res
        .status(404)
        .json({ error: { message: 'Part group not found' } });
      return;
    }
    res.json({ data: { id: group.id } });
  },
);

partGroupsRouter.patch(
  '/projects/:projectId/part-groups/reorder',
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
    const groups = await partGroupsService.reorderPartGroups(
      req.params.projectId,
      orderedIds,
    );
    res.json({ data: groups });
  },
);
