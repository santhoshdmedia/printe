// modals/lead.modals.js
const { Schema, model } = require("mongoose");

const leadSchema = new Schema(
  {
    Lead_Id: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    Place: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      default: "Social Media",
      enum: ["Social Media", "Website", "Referral", "Walk-in", "Other"],
    },
    status: {
      type: String,
      default: "New",
      enum: [
        "New", 
        "Contacted", 
        "Interested", 
        "Not Interested", 
        "Call Back", 
        "Customer Login", 
        "Dealer Login", 
        "Follow-up", 
        "Closed"
      ],
    },
    Assign_member: {
      type: Schema.Types.ObjectId,
      ref: "CustomerCare",
      default: null,
    },
    call_history: [
      {
        called_at: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          required: true,
        },
        notes: {
          type: String,
        },
        next_followup: {
          type: Date,
        },
        called_by: {
          type: Schema.Types.ObjectId,
          ref: "CustomerCare",
        },
      },
    ],
    callback_time: {
      type: Date,
    },
    last_called: {
      type: Date,
    },
    next_followup: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Lead", leadSchema);