const CustomerCareSettings = require('../modals/customercaresettings.modal');
const CustomerCare = require('../modals/Customercaremodal');
const { errorResponse, successResponse } = require('../helper/response.helper');

// Get settings for a user
const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id || req.params.userId;
    
    let settings = await CustomerCareSettings.findOne({ userId })
      .populate('userId', 'name email role phone')
      .populate('lastUpdatedBy', 'name email');
    
    // If settings don't exist, create default settings
    if (!settings) {
      settings = await CustomerCareSettings.create({
        userId,
        lastUpdatedBy: userId
      });
      
      // Populate the newly created document
      settings = await CustomerCareSettings.findById(settings._id)
        .populate('userId', 'name email role phone')
        .populate('lastUpdatedBy', 'name email');
    }
    
    return successResponse(res, 'Settings retrieved successfully', settings);
  } catch (error) {
    console.error('Get user settings error:', error);
    return errorResponse(res, 'Failed to retrieve settings');
  }
};

// Update user settings
const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id || req.params.userId;
    const updateData = req.body;
    
    // Remove userId from updateData if present (can't change userId)
    delete updateData.userId;
    
    // Update lastUpdatedBy
    updateData.lastUpdatedBy = req.user.id;
    
    const settings = await CustomerCareSettings.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    )
    .populate('userId', 'name email role phone')
    .populate('lastUpdatedBy', 'name email');
    
    return successResponse(res, 'Settings updated successfully', settings);
  } catch (error) {
    console.error('Update user settings error:', error);
    return errorResponse(res, 'Failed to update settings');
  }
};

// Update specific section of settings
const updateSectionSettings = async (req, res) => {
  try {
    const userId = req.user.id || req.params.userId;
    const { section, data } = req.body;
    
    if (!section || !data) {
      return errorResponse(res, 'Please provide section and data');
    }
    
    const validSections = [
      'workingHours', 
      'notifications', 
      'leadAssignment', 
      'displayPreferences',
      'emailTemplates',
      'performanceSettings',
      'integrations',
      'autoResponses',
      'backupSettings'
    ];
    
    if (!validSections.includes(section)) {
      return errorResponse(res, 'Invalid section');
    }
    
    const updateData = {
      [section]: data,
      lastUpdatedBy: req.user.id
    };
    
    const settings = await CustomerCareSettings.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    )
    .populate('userId', 'name email role phone')
    .populate('lastUpdatedBy', 'name email');
    
    return successResponse(res, `${section} settings updated successfully`, settings);
  } catch (error) {
    console.error('Update section settings error:', error);
    return errorResponse(res, 'Failed to update section settings');
  }
};

// Get global customer care settings (for admin)
const getGlobalSettings = async (req, res) => {
  try {
    // Get all customer care users
    const customerCareUsers = await CustomerCare.find({ 
      role: { $in: ['customer_care', 'admin'] } 
    }).select('name email role phone isActive');
    
    // Get default settings template
    const defaultSettings = new CustomerCareSettings();
    
    return successResponse(res, 'Global settings retrieved successfully', {
      users: customerCareUsers,
      defaultSettings: {
        workingHours: defaultSettings.workingHours,
        notifications: defaultSettings.notifications,
        leadAssignment: defaultSettings.leadAssignment,
        displayPreferences: defaultSettings.displayPreferences
      }
    });
  } catch (error) {
    console.error('Get global settings error:', error);
    return errorResponse(res, 'Failed to retrieve global settings');
  }
};

// Update global settings (for admin)
const updateGlobalSettings = async (req, res) => {
  try {
    const { defaultSettings, applyToAll } = req.body;
    
    if (!defaultSettings) {
      return errorResponse(res, 'Please provide default settings');
    }
    
    // If applyToAll is true, update all customer care users' settings
    if (applyToAll === true) {
      const customerCareUsers = await CustomerCare.find({ 
        role: { $in: ['customer_care', 'admin'] } 
      }).select('_id');
      
      const bulkOperations = customerCareUsers.map(user => ({
        updateOne: {
          filter: { userId: user._id },
          update: { 
            $set: { 
              ...defaultSettings,
              lastUpdatedBy: req.user.id
            }
          },
          upsert: true
        }
      }));
      
      if (bulkOperations.length > 0) {
        await CustomerCareSettings.bulkWrite(bulkOperations);
      }
    }
    
    return successResponse(res, 'Global settings updated successfully');
  } catch (error) {
    console.error('Update global settings error:', error);
    return errorResponse(res, 'Failed to update global settings');
  }
};

// Reset user settings to default
const resetUserSettings = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Delete existing settings
    await CustomerCareSettings.deleteOne({ userId });
    
    // Create new default settings
    const settings = await CustomerCareSettings.create({
      userId,
      lastUpdatedBy: req.user.id
    });
    
    return successResponse(res, 'Settings reset to default successfully', settings);
  } catch (error) {
    console.error('Reset user settings error:', error);
    return errorResponse(res, 'Failed to reset settings');
  }
};

// Get user's working hours
const getWorkingHours = async (req, res) => {
  try {
    const userId = req.user.id || req.params.userId;
    
    const settings = await CustomerCareSettings.findOne({ userId })
      .select('workingHours');
    
    if (!settings) {
      // Return default working hours
      const defaultSettings = new CustomerCareSettings();
      return successResponse(res, 'Working hours retrieved successfully', defaultSettings.workingHours);
    }
    
    return successResponse(res, 'Working hours retrieved successfully', settings.workingHours);
  } catch (error) {
    console.error('Get working hours error:', error);
    return errorResponse(res, 'Failed to retrieve working hours');
  }
};

// Update working hours
const updateWorkingHours = async (req, res) => {
  try {
    const userId = req.user.id || req.params.userId;
    const { workingHours } = req.body;
    
    if (!Array.isArray(workingHours)) {
      return errorResponse(res, 'Working hours must be an array');
    }
    
    const settings = await CustomerCareSettings.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          workingHours,
          lastUpdatedBy: req.user.id
        }
      },
      { new: true, upsert: true }
    ).select('workingHours');
    
    return successResponse(res, 'Working hours updated successfully', settings.workingHours);
  } catch (error) {
    console.error('Update working hours error:', error);
    return errorResponse(res, 'Failed to update working hours');
  }
};

// Get notification settings
const getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id || req.params.userId;
    
    const settings = await CustomerCareSettings.findOne({ userId })
      .select('notifications');
    
    if (!settings) {
      const defaultSettings = new CustomerCareSettings();
      return successResponse(res, 'Notification settings retrieved successfully', defaultSettings.notifications);
    }
    
    return successResponse(res, 'Notification settings retrieved successfully', settings.notifications);
  } catch (error) {
    console.error('Get notification settings error:', error);
    return errorResponse(res, 'Failed to retrieve notification settings');
  }
};

// Update notification settings
const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id || req.params.userId;
    const { notifications } = req.body;
    
    const settings = await CustomerCareSettings.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          notifications,
          lastUpdatedBy: req.user.id
        }
      },
      { new: true, upsert: true }
    ).select('notifications');
    
    return successResponse(res, 'Notification settings updated successfully', settings.notifications);
  } catch (error) {
    console.error('Update notification settings error:', error);
    return errorResponse(res, 'Failed to update notification settings');
  }
};

// Export user settings
const exportSettings = async (req, res) => {
  try {
    const userId = req.user.id || req.params.userId;
    const { format = 'json' } = req.query;
    
    const settings = await CustomerCareSettings.findOne({ userId })
      .populate('userId', 'name email role phone')
      .populate('lastUpdatedBy', 'name email');
    
    if (!settings) {
      return errorResponse(res, 'Settings not found');
    }
    
    const settingsData = settings.toObject();
    
    if (format === 'csv') {
      // Convert to CSV
      const csvData = convertToCSV(settingsData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=settings-${userId}.csv`);
      return res.send(csvData);
    } else if (format === 'excel') {
      // Convert to Excel (would need xlsx library)
      // For now, return JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=settings-${userId}.json`);
      return res.json(settingsData);
    } else {
      // Default JSON
      return successResponse(res, 'Settings exported successfully', settingsData);
    }
  } catch (error) {
    console.error('Export settings error:', error);
    return errorResponse(res, 'Failed to export settings');
  }
};

// Helper function to convert to CSV
const convertToCSV = (data) => {
  const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, key) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, flattenObject(obj[key], pre + key));
      } else {
        acc[pre + key] = obj[key];
      }
      return acc;
    }, {});
  };
  
  const flatData = flattenObject(data);
  const headers = Object.keys(flatData).join(',');
  const values = Object.values(flatData).map(val => 
    typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
  ).join(',');
  
  return `${headers}\n${values}`;
};

// Check if user is currently available based on working hours
const checkUserAvailability = async (req, res) => {
  try {
    const userId = req.params.userId;
    const now = new Date();
    const day = now.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    const time = now.toLocaleString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }).slice(0, 5); // Get HH:MM format
    
    const settings = await CustomerCareSettings.findOne({ userId })
      .select('workingHours');
    
    if (!settings) {
      return successResponse(res, 'User availability checked', { isAvailable: true });
    }
    
    const todaySchedule = settings.workingHours.find(w => w.day === day);
    
    if (!todaySchedule || !todaySchedule.isWorking) {
      return successResponse(res, 'User availability checked', { 
        isAvailable: false,
        reason: 'Not working today',
        nextAvailable: getNextAvailableTime(settings.workingHours, day, time)
      });
    }
    
    const isAvailable = time >= todaySchedule.startTime && time <= todaySchedule.endTime;
    
    return successResponse(res, 'User availability checked', { 
      isAvailable,
      currentTime: time,
      workingHours: todaySchedule,
      nextAvailable: isAvailable ? null : getNextAvailableTime(settings.workingHours, day, time)
    });
  } catch (error) {
    console.error('Check user availability error:', error);
    return errorResponse(res, 'Failed to check user availability');
  }
};

// Helper function to get next available time
const getNextAvailableTime = (workingHours, currentDay, currentTime) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const currentDayIndex = days.indexOf(currentDay);
  
  for (let i = 0; i < 7; i++) {
    const dayIndex = (currentDayIndex + i) % 7;
    const day = days[dayIndex];
    const schedule = workingHours.find(w => w.day === day);
    
    if (schedule && schedule.isWorking) {
      if (i === 0 && currentTime < schedule.endTime) {
        // Today, but after current time
        return {
          day: 'Today',
          time: schedule.startTime > currentTime ? schedule.startTime : 'Now',
          date: new Date().toISOString().split('T')[0]
        };
      } else if (i > 0) {
        // Future day
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + i);
        return {
          day: i === 1 ? 'Tomorrow' : day.charAt(0).toUpperCase() + day.slice(1),
          time: schedule.startTime,
          date: nextDate.toISOString().split('T')[0]
        };
      }
    }
  }
  
  return null;
};

module.exports = {
  getUserSettings,
  updateUserSettings,
  updateSectionSettings,
  getGlobalSettings,
  updateGlobalSettings,
  resetUserSettings,
  getWorkingHours,
  updateWorkingHours,
  getNotificationSettings,
  updateNotificationSettings,
  exportSettings,
  checkUserAvailability
};