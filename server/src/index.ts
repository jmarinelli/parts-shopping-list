import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { carsRouter } from './routes/cars';
import { projectsRouter } from './routes/projects';
import { partGroupsRouter } from './routes/part-groups';
import { optionsRouter } from './routes/options';
import { partsRouter } from './routes/parts';
import { exchangeRatesRouter } from './routes/exchange-rates';

const app = express();
const port = process.env.PORT || 3001;

if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN }));
}

app.use(express.json());

app.use('/api', healthRouter);
app.use('/api', carsRouter);
app.use('/api', projectsRouter);
app.use('/api', partGroupsRouter);
app.use('/api', optionsRouter);
app.use('/api', partsRouter);
app.use('/api', exchangeRatesRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
