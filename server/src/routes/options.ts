import { Router, Request, Response } from 'express';
import * as optionsService from '../services/options';
import * as partsService from '../services/parts';

export const optionsRouter = Router();

optionsRouter.get(
  '/parts/:partId/options',
  async (req: Request<{ partId: string }>, res: Response) => {
    const part = await partsService.getPartById(req.params.partId);
    if (!part) {
      res.status(404).json({ error: { message: 'Part not found' } });
      return;
    }
    const options = await optionsService.listOptionsByPartId(
      req.params.partId,
    );
    res.json({ data: options });
  },
);

optionsRouter.post(
  '/parts/:partId/options',
  async (req: Request<{ partId: string }>, res: Response) => {
    const { name, price, currency, source, link, comment } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({
        error: { message: 'Name is required and must be a non-empty string' },
      });
      return;
    }
    if (price === undefined || price === null) {
      res
        .status(400)
        .json({ error: { message: 'Price is required' } });
      return;
    }
    if (!currency || typeof currency !== 'string') {
      res
        .status(400)
        .json({ error: { message: 'Currency is required' } });
      return;
    }
    const part = await partsService.getPartById(req.params.partId);
    if (!part) {
      res.status(404).json({ error: { message: 'Part not found' } });
      return;
    }
    const option = await optionsService.createOption(req.params.partId, {
      name: name.trim(),
      price: String(price),
      currency: currency.trim(),
      source: source ?? undefined,
      link: link ?? undefined,
      comment: comment ?? undefined,
    });
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
    const { name, price, currency, source, link, comment } = req.body;
    if (
      name !== undefined &&
      (typeof name !== 'string' || name.trim().length === 0)
    ) {
      res.status(400).json({
        error: { message: 'Name must be a non-empty string' },
      });
      return;
    }
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (price !== undefined) data.price = String(price);
    if (currency !== undefined) data.currency = currency;
    if (source !== undefined) data.source = source;
    if (link !== undefined) data.link = link;
    if (comment !== undefined) data.comment = comment;

    const option = await optionsService.updateOption(
      req.params.optionId,
      data as Parameters<typeof optionsService.updateOption>[1],
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
  '/parts/:partId/options/:optionId/select',
  async (req: Request<{ partId: string; optionId: string }>, res: Response) => {
    const part = await partsService.getPartById(req.params.partId);
    if (!part) {
      res.status(404).json({ error: { message: 'Part not found' } });
      return;
    }
    const option = await optionsService.getOptionById(req.params.optionId);
    if (!option) {
      res.status(404).json({ error: { message: 'Option not found' } });
      return;
    }
    if (option.partId !== req.params.partId) {
      res.status(400).json({
        error: { message: 'Option does not belong to this part' },
      });
      return;
    }
    const updated = await partsService.selectOption(
      req.params.partId,
      req.params.optionId,
    );
    res.json({ data: updated });
  },
);
