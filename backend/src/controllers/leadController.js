const leadService = require('../services/leadService');
const aiService = require('../services/aiService');

class LeadController {
    async submitAssessment(req, res) {
        try {
            const leadData = req.body;
            const mediaFiles = req.files || [];

            // Trigger AI analysis based on uploaded media
            const aiResult = await aiService.analyzeMovingMedia(mediaFiles);

            // Create lead with AI results
            const leadId = await leadService.createLead(leadData, aiResult, mediaFiles);

            res.status(201).json({
                message: 'Thank you! Your moving estimate will be sent to you shortly.',
                leadId
            });
        } catch (error) {
            console.error('Submit Assessment Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async createManualLead(req, res) {
        try {
            const leadId = await leadService.createManualLead(req.body, req.user.id);
            res.status(201).json({ message: 'Lead created successfully', leadId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async listLeads(req, res) {
        try {
            const leads = await leadService.getAllLeads(req.user);
            res.json(leads);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getLead(req, res) {
        try {
            const lead = await leadService.getLeadById(req.params.id, req.user);
            if (!lead) return res.status(404).json({ error: 'Lead not found' });

            // Security: Sales can only see their leads
            if (req.user.role === 'SALES' && lead.assigned_to?.id !== req.user.id && lead.assigned_to?._id?.toString() !== req.user.id && lead.assigned_to?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Access denied' });
            }

            res.json(lead);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addNote(req, res) {
        try {
            const { note } = req.body;
            if (!note) return res.status(400).json({ error: 'Note content is required' });

            const lead = await leadService.getLeadById(req.params.id, req.user);
            if (!lead) return res.status(404).json({ error: 'Lead not found' });

            // Security check for Sales
            if (req.user.role === 'SALES' && lead.assigned_to?._id?.toString() !== req.user.id && lead.assigned_to?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Access denied: You can only add notes to your assigned leads.' });
            }

            await leadService.addNote(req.params.id, note, req.user.id);
            res.json({ message: 'Note added successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addFollowUp(req, res) {
        try {
            const { dateTime, note } = req.body;
            if (!dateTime || !note) return res.status(400).json({ error: 'Date/time and note are required' });

            const lead = await leadService.getLeadById(req.params.id, req.user);
            if (!lead) return res.status(404).json({ error: 'Lead not found' });

            if (req.user.role === 'SALES' && lead.assigned_to?._id?.toString() !== req.user.id && lead.assigned_to?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Access denied: You can only schedule follow-ups for your leads.' });
            }

            await leadService.addFollowUp(req.params.id, { dateTime, note }, req.user.id);
            res.json({ message: 'Follow-up scheduled' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async completeFollowUp(req, res) {
        try {
            const lead = await leadService.getLeadById(req.params.id, req.user);
            if (!lead) return res.status(404).json({ error: 'Lead not found' });

            if (req.user.role === 'SALES' && lead.assigned_to?._id?.toString() !== req.user.id && lead.assigned_to?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Access denied' });
            }

            await leadService.completeFollowUp(req.params.id, req.params.followUpId, req.user.id);
            res.json({ message: 'Follow-up completed' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async assign(req, res) {
        try {
            const { userId } = req.body;
            await leadService.assignLead(req.params.id, userId, req.user.id);
            res.json({ message: 'Lead assigned successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { status, reason } = req.body;
            await leadService.updateStatus(req.params.id, status, req.user.id, req.user.role, reason);
            res.json({ message: 'Status updated successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateInventory(req, res) {
        try {
            const { items } = req.body;
            await leadService.updateInventory(req.params.id, items, req.user.id);
            res.json({ message: 'Inventory updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async finalizePrice(req, res) {
        try {
            const { price, reason } = req.body;
            await leadService.finalizePrice(req.params.id, price, req.user.id, reason);
            res.json({ message: 'Price finalized successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new LeadController();
