const mongoose = require('mongoose');

const ParticipationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  participated: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

ParticipationSchema.index({ student: 1, event: 1 }, { unique: true });

module.exports = mongoose.models.Participation || mongoose.model('Participation', ParticipationSchema);
