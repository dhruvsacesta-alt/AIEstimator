const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String,
    previous_values: mongoose.Schema.Types.Mixed,
    new_values: mongoose.Schema.Types.Mixed,
    reason: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
