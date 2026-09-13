const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Participation = require('../models/Participation');
const authMiddleware = require('../utils/authMiddleware');

// GET /api/events (Public / Admin: List all events with participant count)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).lean();

    // Attach participant counts
    const eventIds = events.map(e => e._id);
    const counts = await Participation.aggregate([
      { $match: { event: { $in: eventIds }, participated: true } },
      { $group: { _id: '$event', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => {
      countMap[c._id.toString()] = c.count;
    });

    const enrichedEvents = events.map(e => ({
      ...e,
      participantCount: countMap[e._id.toString()] || 0
    }));

    res.json({
      success: true,
      events: enrichedEvents
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve events: ' + err.message
    });
  }
});

// POST /api/events (Admin: Create Event)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { event_name, event_date, description } = req.body;
    if (!event_name || !event_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Event name is required.'
      });
    }

    const trimmedName = event_name.trim();
    const existing = await Event.findOne({ event_name: new RegExp(`^${trimmedName}$`, 'i') });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An event with the name "${trimmedName}" already exists.`
      });
    }

    const newEvent = await Event.create({
      event_name: trimmedName,
      event_date: (event_date || '').trim(),
      description: (description || '').trim()
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      event: newEvent
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create event: ' + err.message
    });
  }
});

// PUT /api/events/:id (Admin: Update Event)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { event_name, event_date, description } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event_name && event_name.trim()) {
      event.event_name = event_name.trim();
    }
    if (event_date !== undefined) event.event_date = event_date.trim();
    if (description !== undefined) event.description = description.trim();

    await event.save();

    res.json({
      success: true,
      message: 'Event updated successfully.',
      event
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update event: ' + err.message
    });
  }
});

// DELETE /api/events/:id (Admin: Delete Event)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await Participation.deleteMany({ event: event._id });

    res.json({
      success: true,
      message: `Event "${event.event_name}" and its participation records deleted successfully.`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete event: ' + err.message
    });
  }
});

// GET /api/events/:id/participants (Admin: List participants for an event)
router.get('/:id/participants', authMiddleware, async (req, res) => {
  try {
    const participations = await Participation.find({
      event: req.params.id,
      participated: true
    }).populate('student');

    res.json({
      success: true,
      participants: participations.map(p => p.student).filter(Boolean)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
