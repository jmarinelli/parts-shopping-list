import { Router, Request, Response } from 'express';
import * as exchangeRatesService from '../services/exchange-rates';
import * as totalsService from '../services/totals';
import * as projectsService from '../services/projects';

export const exchangeRatesRouter = Router();

exchangeRatesRouter.get(
  '/projects/:projectId/exchange-rates',
  async (req: Request<{ projectId: string }>, res: Response) => {
    const project = await projectsService.getProjectById(
      req.params.projectId,
    );
    if (!project) {
      res.status(404).json({ error: { message: 'Project not found' } });
      return;
    }
    const rates = await exchangeRatesService.listByProjectId(
      req.params.projectId,
    );
    res.json({ data: rates });
  },
);

exchangeRatesRouter.put(
  '/projects/:projectId/exchange-rates',
  async (req: Request<{ projectId: string }>, res: Response) => {
    const project = await projectsService.getProjectById(
      req.params.projectId,
    );
    if (!project) {
      res.status(404).json({ error: { message: 'Project not found' } });
      return;
    }

    const { rates } = req.body;
    if (!Array.isArray(rates)) {
      res.status(400).json({
        error: { message: 'rates must be an array' },
      });
      return;
    }

    for (const rate of rates) {
      if (
        !rate.fromCurrency ||
        typeof rate.fromCurrency !== 'string' ||
        !rate.toCurrency ||
        typeof rate.toCurrency !== 'string' ||
        rate.rate === undefined ||
        rate.rate === null
      ) {
        res.status(400).json({
          error: {
            message:
              'Each rate must have fromCurrency, toCurrency, and rate',
          },
        });
        return;
      }
      if (isNaN(Number(rate.rate)) || Number(rate.rate) <= 0) {
        res.status(400).json({
          error: { message: 'Rate must be a positive number' },
        });
        return;
      }
    }

    const result = await exchangeRatesService.upsertRates(
      req.params.projectId,
      rates.map((r: { fromCurrency: string; toCurrency: string; rate: number }) => ({
        fromCurrency: r.fromCurrency.trim().toUpperCase(),
        toCurrency: r.toCurrency.trim().toUpperCase(),
        rate: String(r.rate),
      })),
    );
    res.json({ data: result });
  },
);

exchangeRatesRouter.get(
  '/projects/:projectId/totals',
  async (req: Request<{ projectId: string }>, res: Response) => {
    const project = await projectsService.getProjectById(
      req.params.projectId,
    );
    if (!project) {
      res.status(404).json({ error: { message: 'Project not found' } });
      return;
    }

    const includeOptionals = req.query.includeOptionals !== 'false';
    const queryCurrency = req.query.currency as string | undefined;

    // When no currency specified, default to first available currency from this project
    let currency: string;
    if (queryCurrency) {
      currency = queryCurrency.toUpperCase();
    } else {
      const available = await totalsService.getAvailableCurrencies(req.params.projectId);
      currency = available.includes('USD') ? 'USD' : available[0] || 'USD';
    }

    const result = await totalsService.calculateTotals(
      req.params.projectId,
      currency,
      includeOptionals,
    );

    if ('error' in result) {
      res.status(400).json({ error: { message: result.error, missingPair: result.missingPair, availableCurrencies: result.availableCurrencies } });
      return;
    }

    res.json({ data: result });
  },
);
