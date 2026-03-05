import { Router, Request, Response } from 'express';
import * as carsService from '../services/cars';

export const carsRouter = Router();

carsRouter.get('/cars', async (_req: Request, res: Response) => {
  const cars = await carsService.listCars();
  res.json({ data: cars });
});

carsRouter.get('/cars/:carId', async (req: Request<{ carId: string }>, res: Response) => {
  const car = await carsService.getCarById(req.params.carId);
  if (!car) {
    res.status(404).json({ error: { message: 'Car not found' } });
    return;
  }
  res.json({ data: car });
});

carsRouter.post('/cars', async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res
      .status(400)
      .json({ error: { message: 'Name is required and must be a non-empty string' } });
    return;
  }
  const car = await carsService.createCar(name.trim());
  res.status(201).json({ data: car });
});

carsRouter.put('/cars/:carId', async (req: Request<{ carId: string }>, res: Response) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res
      .status(400)
      .json({ error: { message: 'Name is required and must be a non-empty string' } });
    return;
  }
  const car = await carsService.updateCar(req.params.carId, name.trim());
  if (!car) {
    res.status(404).json({ error: { message: 'Car not found' } });
    return;
  }
  res.json({ data: car });
});

carsRouter.delete('/cars/:carId', async (req: Request<{ carId: string }>, res: Response) => {
  const car = await carsService.deleteCar(req.params.carId);
  if (!car) {
    res.status(404).json({ error: { message: 'Car not found' } });
    return;
  }
  res.json({ data: { id: car.id } });
});
