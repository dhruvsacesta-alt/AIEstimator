const AuditLog = require('../models/AuditLog');

/**
 * Global audit log helper. 
 * Records system-wide actions into the AuditLog collection.
 */
async function logAction({ leadId, userId, action, previousValues, newValues, reason }) {
    try {
        const log = new AuditLog({
            leadId,
            userId,
            action,
            previous_values: previousValues,
            new_values: newValues,
            reason,
            timestamp: new Date()
        });
        await log.save();
    } catch (error) {
        console.error('Audit Logging Failed:', error);
    }
}

module.exports = { logAction };
