import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { usersRouter } from '../modules/users/users.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);

export { router };
