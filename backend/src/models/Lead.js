const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    // Basic Details
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    // Move Details
    move_type: { type: String, enum: ['Residential', 'Commercial', 'Office'], required: true },
    move_date: { type: String, required: true },
    origin_address: { type: String, required: true },
    origin_pincode: { type: String, required: true },
    destination_address: { type: String, required: true },
    destination_pincode: { type: String, required: true },

    // Property Details
    property_type: { type: String, enum: ['Apartment', 'Independent House', 'Office', 'Other'], required: true },
    pickup_floor: { type: Number, default: 0 },
    drop_floor: { type: Number, default: 0 },
    pickup_lift: { type: String, enum: ['Yes', 'No'], default: 'No' },
    drop_lift: { type: String, enum: ['Yes', 'No'], default: 'No' },

    // Status & Priority
    status: {
        type: String,
        enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'CONTACTED', 'PROPOSAL_SENT', 'BOOKED', 'HANDOVER', 'COMPLETED', 'CANCELLED'],
        default: 'NEW'
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // AI Output
    ai_estimated_price: { type: Number, default: 0 },
    ai_estimated_volume: { type: String }, // e.g. "1500 cu ft"
    ai_confidence_score: { type: Number, default: 0 },

    // Verification
    final_price: { type: Number },
    price_adjustment_reason: { type: String },
    estimation_confirmed: { type: Boolean, default: false },

    // Communication
    contact_attempts: { type: Number, default: 0 },
    last_contact_date: { type: Date },
    contact_status: { type: String, enum: ['Not Contacted', 'Contacted', 'No Response'], default: 'Not Contacted' },
    preferred_contact_method: { type: String, enum: ['Call', 'WhatsApp', 'Email'], default: 'Call' },

    // Proposal & Booking
    proposal_sent_date: { type: Date },
    proposal_sent_via: { type: String, enum: ['Email', 'WhatsApp'] },
    booking_received: { type: String, enum: ['Yes', 'No'], default: 'No' },
    payment_mode: { type: String },
    booking_confirmation_date: { type: Date },

    // Operation
    assigned_crew: { type: String },
    assigned_vehicle: { type: String },
    handover_completion_date: { type: Date },

    // Items List
    items: [{
        item_name: String,
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
        category: { type: String, enum: ['Furniture', 'Electronics', 'Fragile', 'Misc'], default: 'Misc' },
        is_fragile: { type: Boolean, default: false },
        source: { type: String, enum: ['AI', 'MANUAL'], default: 'AI' }
    }],

    // Media
    media: [{
        file_path: String,
        file_type: String,
        uploaded_at: { type: Date, default: Date.now }
    }],

    // Cancellation
    cancellation_reason: String,
    cancelled_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellation_date: { type: Date },

    // Logs
    history: [{
        action: String,
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        previous_values: mongoose.Schema.Types.Mixed,
        new_values: mongoose.Schema.Types.Mixed,
        reason: String,
        timestamp: { type: Date, default: Date.now }
    }],
    follow_ups: [{
        dateTime: { type: Date, required: true },
        note: { type: String, required: true },
        status: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' },
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        created_at: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
