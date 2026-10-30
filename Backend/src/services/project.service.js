import projectModel from '../models/project.model.js';
import { isObjectIdOrHexString } from 'mongoose';

export const createProject = async({name, userId})=>{

    if (typeof name !== 'string' || !name.trim()) {
        throw new Error('A project name is required');
    }
    if (!isObjectIdOrHexString(userId)) {
        throw new Error('A valid userId is required');
    }

    return projectModel.create({
        name,
        users: [userId]
    });
}
