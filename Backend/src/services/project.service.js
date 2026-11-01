import projectModel from '../models/project.model.js';
import { isObjectIdOrHexString } from 'mongoose';
import userModel from '../models/user.model.js';

function projectError(statusCode, message) {
    return Object.assign(new Error(message), { statusCode });
}

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

export const getAllProjects = async({userId})=>{

    if(!userId){
        throw new Error('A valid userId is required');
    }

    const projects = await projectModel.find({
        users: userId
    });

    return projects;

}

export const addUsersToProject = async({projectId, users, userId}) =>{

    if (!isObjectIdOrHexString(projectId)) {
        throw projectError(400, 'A valid projectId is required');
    }
    if (!Array.isArray(users) || !users.length || !users.every(isObjectIdOrHexString)) {
        throw projectError(400, 'A non-empty array of valid user IDs is required');
    }
    if (!isObjectIdOrHexString(userId)) {
        throw projectError(400, 'A valid userId is required');
    }

    const project = await projectModel.findById(projectId).select('users');
    if (!project) {
        throw projectError(404, 'Project not found');
    }
    if (!project.users.some((id) => String(id) === String(userId).toLowerCase())) {
        throw projectError(403, 'You are not authorized to add users to this project');
    }

    const uniqueUsers = [...new Set(users.map((id) => String(id).toLowerCase()))];
    const existingUsers = await userModel.find({ _id: { $in: uniqueUsers } }).select('_id');
    if (existingUsers.length !== uniqueUsers.length) {
        throw projectError(404, 'One or more users were not found');
    }

    // Recheck membership in the write so revoked access cannot authorize an update.
    const updatedProject = await projectModel.findOneAndUpdate(
        { _id: projectId, users: userId },
        { $addToSet: { users: { $each: uniqueUsers } } },
        { new: true, runValidators: true }
    );
    if (!updatedProject) {
        throw projectError(403, 'The project is no longer available or your access has changed');
    }

    return updatedProject;

}

export const getProjectById = async({projectId}) =>{
    if(!projectId || !isObjectIdOrHexString(projectId)){
        throw new Error('A valid projectId is required');
    }

    const project = await projectModel.findById(projectId).populate('users', 'username email');

    if(!project){
        throw new Error('Project not found');
    }

    return project;
}
