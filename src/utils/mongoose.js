const mongoose = require('mongoose');

const modelCache = {};

function getOrCreateModel(modelName, schema) {
    // Check if model already exists in cache
    if (modelCache[modelName]) {
        return modelCache[modelName];
    }

    // Check if model is already registered with Mongoose
    try {
        // Try to retrieve existing model
        const existingModel = mongoose.model(modelName);
        modelCache[modelName] = existingModel;
        return existingModel;
    } catch {
        // If model doesn't exist, create and cache it
        const model = mongoose.model(modelName, schema);
        modelCache[modelName] = model;
        return model;
    }
}

module.exports = { getOrCreateModel };