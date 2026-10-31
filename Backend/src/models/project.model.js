import mongoose from 'mongoose';
import { PROJECT_NAME_MAX_LENGTH } from '../constants/project.constants.js';


const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        maxLength: [PROJECT_NAME_MAX_LENGTH, `Name must be at most ${PROJECT_NAME_MAX_LENGTH} characters long`]
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }]
})

const projectModel = mongoose.model('project', projectSchema);

export default projectModel;
