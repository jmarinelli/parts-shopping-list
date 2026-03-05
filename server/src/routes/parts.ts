import { Router, Request, Response } from 'express';
import * as partsService from '../services/parts';
import * as optionsService from '../services/options';

export const partsRouter = Router();

partsRouter.get(
  '/options/:optionId/parts',
  async (req: Request<{ optionId: string }>, res: Response) => {
    const option = await optionsService.getOptionById(req.params.optionId);
    if (!option) {
      res.status(404).json({ error: { message: 'Option not found' } });
      return;
    }
    const parts = await partsService.listPartsByOptionId(
      req.params.optionId,
    );
    res.json({ data: parts });
  },
);

partsRouter.post(
  '/options/:optionId/parts',
  async (req: Request<{ optionId: string }>, res: Response) => {
    const { name, price, currency, source, link, comment } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: { message: 'Name is required' } });
      return;
    }
    if (price === undefined || price === null) {
      res.status(400).json({ error: { message: 'Price is required' } });
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      res.status(400).json({
        error: { message: 'Price must be a valid number >= 0' },
      });
      return;
    }
    if (!currency || typeof currency !== 'string') {
      res
        .status(400)
        .json({ error: { message: 'Currency is required' } });
      return;
    }

    const option = await optionsService.getOptionById(req.params.optionId);
    if (!option) {
      res.status(404).json({ error: { message: 'Option not found' } });
      return;
    }

    const part = await partsService.createPart(req.params.optionId, {
      name: name.trim(),
      price: numPrice,
      currency: currency.trim().toUpperCase(),
      source: source ?? undefined,
      link: link ?? undefined,
      comment: comment ?? undefined,
    });
    res.status(201).json({ data: part });
  },
);

partsRouter.get(
  '/parts/:partId',
  async (req: Request<{ partId: string }>, res: Response) => {
    const part = await partsService.getPartById(req.params.partId);
    if (!part) {
      res.status(404).json({ error: { message: 'Part not found' } });
      return;
    }
    res.json({ data: part });
  },
);

partsRouter.put(
  '/parts/:partId',
  async (req: Request<{ partId: string }>, res: Response) => {
    const { name, price, currency, source, link, comment, status } =
      req.body;

    if (
      name !== undefined &&
      (typeof name !== 'string' || name.trim().length === 0)
    ) {
      res.status(400).json({
        error: { message: 'Name must be a non-empty string' },
      });
      return;
    }
    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        res.status(400).json({
          error: { message: 'Price must be a valid number >= 0' },
        });
        return;
      }
    }
    if (
      status !== undefined &&
      !['pending', 'ordered', 'owned'].includes(status)
    ) {
      res
        .status(400)
        .json({ error: { message: 'Invalid status' } });
      return;
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (price !== undefined) data.price = Number(price);
    if (currency !== undefined) data.currency = currency;
    if (source !== undefined) data.source = source;
    if (link !== undefined) data.link = link;
    if (comment !== undefined) data.comment = comment;
    if (status !== undefined) data.status = status;

    const result = await partsService.updatePart(
      req.params.partId,
      data as Parameters<typeof partsService.updatePart>[1],
    );
    if (!result) {
      res.status(404).json({ error: { message: 'Part not found' } });
      return;
    }
    if ('validationError' in result) {
      res
        .status(400)
        .json({ error: { message: result.validationError } });
      return;
    }
    res.json({ data: result });
  },
);

partsRouter.delete(
  '/parts/:partId',
  async (req: Request<{ partId: string }>, res: Response) => {
    const result = await partsService.deletePart(req.params.partId);
    if (!result) {
      res.status(404).json({ error: { message: 'Part not found' } });
      return;
    }
    res.json({ data: { id: result.id } });
  },
);
