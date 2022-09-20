const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    title: String, 
    purpose: String,
    checklist_item1: String,
    checklist_item2: String,
    checklist_item3: String,
    location: String, 
    image_id: String,
    
})

module.exports = mongoose.model('Post', schema);