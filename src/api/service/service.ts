import { Request, Response } from 'express';

export const helloService = {
  getHelloWorld: (req: Request, res: Response) => {
    res.json({ message: 'Hola mundo' });
  }
};
