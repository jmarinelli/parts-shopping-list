import { Router, Request, Response } from 'express';
import * as optionsService from '../services/options';
import * as partGroupsService from '../services/part-groups';

export const optionsRouter = Router();

optionsRouter.get(
  '/part-groups/:partGroupId/options',
  async (req: Request<{ partGroupId: string }>, res: Response) => {
    const group = await partGroupsService.getPartGroupById(
      req.params.partGroupId,
    );
    if (!group) {
      res
        .status(404)
        .json({ error: { message: 'Part group not found' } });
      return;
    }
    const options = await optionsService.listOptionsByPartGroupId(
      req.params.partGroupId,
    );
    res.json({ data: options });
  },
);

optionsRouter.post(
  '/part-groups/:partGroupId/options',
  async (req: Request<{ partGroupId: string }>, res: Response) => {
    const { name, firstPart } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({
        error: { message: 'Name is required' },
      });
      return;
    }
    if (!firstPart || typeof firstPart !== 'object') {
      res.status(400).json({
        error: { message: 'First part is required' },
      });
      return;
    }
    if (
      !firstPart.name ||
      typeof firstPart.name !== 'string' ||
      firstPart.name.trim().length === 0
    ) {
      res.status(400).json({
        error: { message: 'First part name is required' },
      });
      return;
    }
    if (firstPart.price === undefined || firstPart.price === null) {
      res.status(400).json({
        error: { message: 'First part price is required' },
      });
      return;
    }
    const price = Number(firstPart.price);
    if (isNaN(price) || price < 0) {
      res.status(400).json({
        error: { message: 'First part price must be a valid number >= 0' },
      });
      return;
    }
    if (
      !firstPart.currency ||
      typeof firstPart.currency !== 'string'
    ) {
      res.status(400).json({
        error: { message: 'First part currency is required' },
      });
      return;
    }
    const group = await partGroupsService.getPartGroupById(
      req.params.partGroupId,
    );
    if (!group) {
      res
        .status(404)
        .json({ error: { message: 'Part group not found' } });
      return;
    }
    const option = await optionsService.createOption(
      req.params.partGroupId,
      {
        name: name.trim(),
        firstPart: {
          name: firstPart.name.trim(),
          price,
          currency: firstPart.currency.trim().toUpperCase(),
          source: firstPart.source ?? undefined,
          link: firstPart.link ?? undefined,
          comment: firstPart.comment ?? undefined,
        },
      },
    );
    res.status(201).json({ data: option });
  },
);

optionsRouter.get(
  '/options/:optionId',
  async (req: Request<{ optionId: string }>, res: Response) => {
    const option = await optionsService.getOptionById(req.params.optionId);
    if (!option) {
      res.status(404).json({ error: { message: 'Option not found' } });
      return;
    }
    res.json({ data: option });
  },
);

optionsRouter.put(
  '/options/:optionId',
  async (req: Request<{ optionId: string }>, res: Response) => {
    const { name } = req.body;
    if (
      name !== undefined &&
      (typeof name !== 'string' || name.trim().length === 0)
    ) {
      res.status(400).json({
        error: { message: 'Name must be a non-empty string' },
      });
      return;
    }
    const data: { name?: string } = {};
    if (name !== undefined) data.name = name.trim();

    const option = await optionsService.updateOption(
      req.params.optionId,
      data,
    );
    if (!option) {
      res.status(404).json({ error: { message: 'Option not found' } });
      return;
    }
    res.json({ data: option });
  },
);

optionsRouter.delete(
  '/options/:optionId',
  async (req: Request<{ optionId: string }>, res: Response) => {
    const result = await optionsService.deleteOption(req.params.optionId);
    if (!result) {
      res.status(404).json({ error: { message: 'Option not found' } });
      return;
    }
    res.json({ data: result });
  },
);

optionsRouter.patch(
  '/part-groups/:partGroupId/options/:optionId/select',
  async (
    req: Request<{ partGroupId: string; optionId: string }>,
    res: Response,
  ) => {
    const group = await partGroupsService.getPartGroupById(
      req.params.partGroupId,
    );
    if (!group) {
      res
        .status(404)
        .json({ error: { message: 'Part group not found' } });
      return;
    }
    const option = await optionsService.getOptionById(req.params.optionId);
    if (!option) {
      res.status(404).json({ error: { message: 'Option not found' } });
      return;
    }
    if (option.partGroupId !== req.params.partGroupId) {
      res.status(400).json({
        error: { message: 'Option does not belong to this part group' },
      });
      return;
    }
    const updated = await partGroupsService.selectOption(
      req.params.partGroupId,
      req.params.optionId,
    );
    res.json({ data: updated });
  },
);
