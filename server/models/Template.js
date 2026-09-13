const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  template_name: {
    type: String,
    required: true,
    trim: true
  },
  template_file: {
    type: String,
    required: true,
    trim: true
  },
  fields_config: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: {}
  },
  is_active: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Template', TemplateSchema);
