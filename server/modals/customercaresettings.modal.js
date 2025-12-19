const mongoose = require('mongoose');

const workingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  isWorking: {
    type: Boolean,
    default: true
  },
  startTime: {
    type: String, // Format: "09:00"
    default: '09:00'
  },
  endTime: {
    type: String, // Format: "18:00"
    default: '18:00'
  }
}, { _id: false });

const notificationSettingsSchema = new mongoose.Schema({
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  newLeadAlert: {
    type: Boolean,
    default: true
  },
  followupReminder: {
    type: Boolean,
    default: true
  },
  reminderBeforeHours: {
    type: Number,
    default: 1, // hours before follow-up
    min: 1,
    max: 24
  }
}, { _id: false });

const leadAssignmentSchema = new mongoose.Schema({
  autoAssign: {
    type: Boolean,
    default: true
  },
  assignmentMethod: {
    type: String,
    enum: ['round_robin', 'load_balance', 'manual', 'priority_based'],
    default: 'round_robin'
  },
  maxLeadsPerDay: {
    type: Number,
    default: 20,
    min: 1
  },
  reassignInactiveHours: {
    type: Number,
    default: 24, // hours after which inactive leads are reassigned
    min: 1
  }
}, { _id: false });

const customerCareSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerCare',
    required: true,
    unique: true
  },
  // Working hours settings
  workingHours: [workingHoursSchema],
  
  // Notification settings
  notifications: notificationSettingsSchema,
  
  // Lead assignment settings
  leadAssignment: leadAssignmentSchema,
  
  // Display preferences
  displayPreferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    itemsPerPage: {
      type: Number,
      default: 20,
      min: 5,
      max: 100
    }
  },
  
  // Email templates
  emailTemplates: {
    welcomeEmail: {
      subject: String,
      body: String
    },
    followupEmail: {
      subject: String,
      body: String
    },
    closureEmail: {
      subject: String,
      body: String
    }
  },
  
  // Performance settings
  performanceSettings: {
    dailyTargetLeads: {
      type: Number,
      default: 10
    },
    monthlyTargetConversion: {
      type: Number,
      default: 30 // percentage
    },
    kpiMetrics: [{
      name: String,
      target: Number,
      unit: String
    }]
  },
  
  // Integrations
  integrations: {
    whatsappEnabled: {
      type: Boolean,
      default: false
    },
    smsEnabled: {
      type: Boolean,
      default: false
    },
    emailIntegration: {
      type: Boolean,
      default: false
    },
    crmSync: {
      type: Boolean,
      default: false
    }
  },
  
  // Auto-response settings
  autoResponses: {
    firstContact: {
      enabled: Boolean,
      message: String,
      delayMinutes: Number
    },
    followup: {
      enabled: Boolean,
      message: String,
      delayDays: Number
    },
    closure: {
      enabled: Boolean,
      message: String
    }
  },
  
  // Backup and export settings
  backupSettings: {
    autoBackup: {
      type: Boolean,
      default: false
    },
    backupFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    exportFormat: {
      type: String,
      enum: ['csv', 'excel', 'pdf'],
      default: 'excel'
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Pre-save middleware to set default working hours if not provided
customerCareSettingsSchema.pre('save', function(next) {
  if (!this.workingHours || this.workingHours.length === 0) {
    this.workingHours = [
      { day: 'monday', isWorking: true, startTime: '09:00', endTime: '18:00' },
      { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '18:00' },
      { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '18:00' },
      { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '18:00' },
      { day: 'friday', isWorking: true, startTime: '09:00', endTime: '18:00' },
      { day: 'saturday', isWorking: true, startTime: '10:00', endTime: '14:00' },
      { day: 'sunday', isWorking: false, startTime: '00:00', endTime: '00:00' }
    ];
  }
  next();
});

module.exports = mongoose.model('CustomerCareSettings', customerCareSettingsSchema);