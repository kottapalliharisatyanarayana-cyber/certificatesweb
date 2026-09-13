const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  event_name: {
    type: String,
    required: [true, 'Event name is required'],
    unique: true,
    trim: true,
    index: true
  },
  event_date: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);
