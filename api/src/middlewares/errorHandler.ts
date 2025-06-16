import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[Erro]', err.message);

  res.status(400).json({
    status: 'error',
    message: err.message || 'Erro interno no servidor',
  });
}