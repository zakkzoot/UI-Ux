import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from './auth.schema';
import * as authController from './auth.controller';
import { AuthenticatedRequest } from '../../types';

const router = Router();

router.post('/register', validate(RegisterSchema), authController.register);
router.post('/login', validate(LoginSchema), authController.login);
router.post('/refresh', validate(RefreshTokenSchema), authController.refresh);
router.post(
  '/logout',
  (req: Request, res: Response, next: NextFunction) =>
    authenticate(req as AuthenticatedRequest, res, next),
  (req: Request, res: Response, next: NextFunction) =>
    authController.logout(req as AuthenticatedRequest, res, next),
);
router.get(
  '/me',
  (req: Request, res: Response, next: NextFunction) =>
    authenticate(req as AuthenticatedRequest, res, next),
  (req: Request, res: Response, next: NextFunction) =>
    authController.me(req as AuthenticatedRequest, res, next),
);

export { router as authRouter };
