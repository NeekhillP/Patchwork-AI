import {Router} from 'express';
import {body} from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import {authUserMiddleware} from '../middleware/auth.middleware.js';
import { PROJECT_NAME_MAX_LENGTH } from '../constants/project.constants.js';

const router = Router();


/**
 * @route POST /projects/create
 * @desc Create a new project
 * @access Private
 */
router.post('/create', 
    authUserMiddleware,
    body('name')
        .isString().withMessage('Name must be a string')
        .bail()
        .trim()
        .notEmpty().withMessage('Name is required')
        .bail()
        .custom((name) => name.length <= PROJECT_NAME_MAX_LENGTH)
        .withMessage(`Name must be at most ${PROJECT_NAME_MAX_LENGTH} characters long`),
    projectController.createProjectController
)


export default router;
