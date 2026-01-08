const Lead = require('../models/Lead');
const { logAction } = require('../utils/auditLogger');

const STATUS_PIPELINE = [
    'NEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'CONTACTED',
    'PROPOSAL_SENT',
    'BOOKED',
    'HANDOVER',
    'COMPLETED'
];

class LeadService {
    async createManualLead(data, userId) {
        const lead = new Lead({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            move_type: data.move_type,
            move_date: data.move_date,
            origin_address: data.origin_address,
            origin_pincode: data.origin_pincode,
            destination_address: data.destination_address,
            destination_pincode: data.destination_pincode,
            property_type: data.property_type || 'Apartment',
            pickup_floor: data.pickup_floor || 0,
            drop_floor: data.drop_floor || 0,
            pickup_lift: data.pickup_lift || 'No',
            drop_lift: data.drop_lift || 'No',
            status: 'NEW'
        });

        const entry = {
            action: 'MANUAL_ENTRY',
            user_id: userId,
            new_values: { source: 'CRM_MANUAL' }
        };
        lead.history.push(entry);

        await lead.save();
        await logAction({ leadId: lead._id, userId, action: 'MANUAL_ENTRY', newValues: entry.new_values });

        return lead._id;
    }

    async createLead(data, aiResult, mediaFiles = []) {
        const lead = new Lead({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone,

            move_type: data.moveType === 'Office' ? 'Commercial' : data.moveType,
            move_date: data.moveDate,
            origin_address: data.originAddress,
            origin_pincode: data.originPincode,
            destination_address: data.destinationAddress,
            destination_pincode: data.destinationPincode,

            property_type: data.propertyType,
            pickup_floor: Number(data.pickupFloor) || 0,
            drop_floor: Number(data.dropFloor) || 0,
            pickup_lift: data.pickupLift,
            drop_lift: data.dropLift,

            ai_estimated_price: aiResult.estimatedPrice || 0,
            ai_estimated_volume: aiResult.estimatedVolume || "0 cu ft",
            ai_confidence_score: aiResult.confidenceScore || 0,

            items: (aiResult.items || []).map(item => ({
                item_name: item.item_name,
                quantity: item.quantity,
                category: item.category || 'Misc',
                is_fragile: item.is_fragile || false,
                source: 'AI'
            })),

            media: mediaFiles.map(file => ({
                file_path: file.path.replace(/\\/g, '/'),
                file_type: file.mimetype
            }))
        });

        const entry = {
            action: 'LEAD_CREATED',
            new_values: { status: 'NEW', ai_estimated_price: aiResult.estimatedPrice }
        };
        lead.history.push(entry);

        await lead.save();
        await logAction({ leadId: lead._id, action: 'LEAD_CREATED', newValues: entry.new_values });

        return lead._id;
    }

    async getAllLeads(user) {
        let query = {};
        if (user.role === 'SALES') {
            query = { assigned_to: user.id };
        }
        return await Lead.find(query).populate('assigned_to', 'name email').sort({ createdAt: -1 });
    }

    async getLeadById(id, user) {
        const lead = await Lead.findById(id).populate('assigned_to', 'name email');
        if (!lead) return null;

        if (user && user.role === 'SALES') {
            // Find the last assignment to this specific user
            // We look from the end of history for the last occurrence where they were assigned
            let lastAssignmentIndex = -1;
            for (let i = lead.history.length - 1; i >= 0; i--) {
                const h = lead.history[i];
                if (h.action === 'LEAD_ASSIGNED' && h.new_values && h.new_values.assigned_to && h.new_values.assigned_to.toString() === user.id) {
                    lastAssignmentIndex = i;
                    break;
                }
            }

            if (lastAssignmentIndex !== -1) {
                // Return history starting from that assignment, PLUS any shared notes even before that?
                // Actually the user said "only note not all logs". 
                // Let's include all items that are NOTE_ADDED regardless of time, and all other items after assignment.
                lead.history = lead.history.filter((h, index) => {
                    if (h.action === 'NOTE_ADDED') return true;
                    return index >= lastAssignmentIndex;
                });
            } else {
                // If never assigned (shouldn't happen for SALES who can access it), but just in case, show only notes
                lead.history = lead.history.filter(h => h.action === 'NOTE_ADDED');
            }
        }

        return lead;
    }

    async addNote(leadId, note, userId) {
        const lead = await Lead.findById(leadId);
        if (!lead) throw new Error('Lead not found');

        const entry = {
            action: 'NOTE_ADDED',
            user_id: userId,
            reason: note,
            timestamp: new Date()
        };
        lead.history.push(entry);
        await lead.save();
        await logAction({ ...entry, leadId });
    }

    async addFollowUp(leadId, data, userId) {
        const lead = await Lead.findById(leadId);
        if (!lead) throw new Error('Lead not found');

        const followUp = {
            dateTime: new Date(data.dateTime),
            note: data.note,
            created_by: userId
        };

        lead.follow_ups.push(followUp);

        // Log to history
        lead.history.push({
            action: 'FOLLOW_UP_SCHEDULED',
            user_id: userId,
            reason: `Scheduled for: ${new Date(data.dateTime).toLocaleString()} - ${data.note}`
        });

        await lead.save();
        await logAction({ leadId, userId, action: 'FOLLOW_UP_SCHEDULED', newValues: followUp });
    }

    async completeFollowUp(leadId, followUpId, userId) {
        const lead = await Lead.findById(leadId);
        if (!lead) throw new Error('Lead not found');

        const followUp = lead.follow_ups.id(followUpId);
        if (!followUp) throw new Error('Follow-up not found');

        followUp.status = 'COMPLETED';

        lead.history.push({
            action: 'FOLLOW_UP_COMPLETED',
            user_id: userId,
            reason: `Completed follow-up: ${followUp.note}`
        });

        await lead.save();
        await logAction({ leadId, userId, action: 'FOLLOW_UP_COMPLETED', newValues: { followUpId } });
    }

    async assignLead(leadId, userId, adminId) {
        const lead = await Lead.findById(leadId);
        if (!lead) throw new Error('Lead not found');

        const previousValues = { assigned_to: lead.assigned_to, status: lead.status };

        // Handle unassignment or assignment
        const newUserId = userId && userId !== '' ? userId : null;
        lead.assigned_to = newUserId;

        if (newUserId) {
            lead.status = 'ASSIGNED';
        } else {
            lead.status = 'NEW';
        }

        const entry = {
            action: newUserId ? 'LEAD_ASSIGNED' : 'LEAD_UNASSIGNED',
            user_id: adminId,
            previous_values: previousValues,
            new_values: { assigned_to: newUserId, status: lead.status }
        };
        lead.history.push(entry);
        await lead.save();
        await logAction({ ...entry, leadId });
    }

    async updateStatus(leadId, newStatus, userId, role, reason) {
        const lead = await Lead.findById(leadId);
        if (!lead) throw new Error('Lead not found');

        if (newStatus === 'CANCELLED') {
            if (!reason) throw new Error('Cancellation reason required');
            lead.cancellation_reason = reason;
            lead.cancelled_by = userId;
            lead.cancellation_date = new Date();
        } else {
            const currentIndex = STATUS_PIPELINE.indexOf(lead.status);
            const nextIndex = STATUS_PIPELINE.indexOf(newStatus);
            if (role === 'SALES' && nextIndex !== currentIndex + 1) {
                throw new Error(`Strict flow: Must move to ${STATUS_PIPELINE[currentIndex + 1]}`);
            }
            if (role === 'ADMIN' && (nextIndex !== currentIndex + 1) && !reason) {
                throw new Error('Override requires reason');
            }
        }

        const previousValues = { status: lead.status };
        lead.status = newStatus;

        const entry = {
            action: 'STATUS_UPDATED',
            user_id: userId,
            previous_values: previousValues,
            new_values: { status: newStatus },
            reason
        };
        lead.history.push(entry);
        await lead.save();
        await logAction({ ...entry, leadId });
    }

    async updateInventory(leadId, items, userId) {
        const lead = await Lead.findById(leadId);
        if (!lead) throw new Error('Lead not found');

        lead.items = items.map(it => ({
            item_name: it.item_name,
            quantity: it.quantity,
            category: it.category,
            is_fragile: it.is_fragile,
            source: it.source || 'MANUAL'
        }));

        // Automatic status transition from ASSIGNED to IN_PROGRESS when manual adjustment starts
        if (lead.status === 'ASSIGNED') {
            lead.status = 'IN_PROGRESS';
            lead.history.push({ action: 'STATUS_UPDATED', user_id: userId, new_values: { status: 'IN_PROGRESS' }, reason: 'Automatic transition on inventory review' });
        }

        const entry = { action: 'INVENTORY_UPDATED', user_id: userId, new_values: { items: lead.items } };
        lead.history.push(entry);
        await lead.save();
        await logAction({ ...entry, leadId });
    }

    async finalizePrice(leadId, price, userId, reason) {
        const lead = await Lead.findById(leadId);
        if (!lead) throw new Error('Lead not found');

        lead.final_price = price;
        lead.price_adjustment_reason = reason;
        lead.estimation_confirmed = true;

        const entry = { action: 'PRICE_FINALIZED', user_id: userId, new_values: { final_price: price }, reason };
        lead.history.push(entry);
        await lead.save();
        await logAction({ ...entry, leadId });
    }

    async updateLogistics(leadId, logData, userId) {
        const lead = await Lead.findById(leadId);
        if (!lead) throw new Error('Lead not found');

        Object.assign(lead, logData);
        lead.history.push({ action: 'LOGISTICS_UPDATED', user_id: userId, new_values: logData });
        await lead.save();
    }
}

module.exports = new LeadService();
