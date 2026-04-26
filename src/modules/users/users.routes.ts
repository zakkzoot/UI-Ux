import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { UserRole, AuthenticatedRequest } from '../../types';
import { UpdateUserSchema } from './users.schema';
import * as usersController from './users.controller';

const router = Router();

const auth = (req: Request, res: Response, next: NextFunction): void =>
  authenticate(req as AuthenticatedRequest, res, next);
const asAuth = (handler: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    handler(req as AuthenticatedRequest, res, next);
  };

router.use(auth);

router.get('/', authorize(UserRole.ADMIN), asAuth(usersController.getAll));
router.get('/:id', asAuth(usersController.getById));
router.patch('/:id', validate(UpdateUserSchema), asAuth(usersController.updateById));
router.delete('/:id', authorize(UserRole.ADMIN), asAuth(usersController.deleteById));

export { router as usersRouter };
