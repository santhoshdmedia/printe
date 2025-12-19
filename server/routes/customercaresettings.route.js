const express = require('express');
const router = express.Router();
const {
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
} = require('../controller/customerSettings.controller');

// User-specific routes (requires authentication)
router.get('/my-settings', getUserSettings);
router.put('/my-settings', updateUserSettings);
router.put('/my-settings/section', updateSectionSettings);
router.get('/my-settings/working-hours', getWorkingHours);
router.put('/my-settings/working-hours', updateWorkingHours);
router.get('/my-settings/notifications', getNotificationSettings);
router.put('/my-settings/notifications', updateNotificationSettings);
router.get('/my-settings/export', exportSettings);
router.post('/my-settings/reset', resetUserSettings);

// Admin routes (requires admin role)
router.get('/global', getGlobalSettings);
router.put('/global', updateGlobalSettings);

// User-specific routes (admin can access any user's settings)
router.get('/:userId', getUserSettings);
router.put('/:userId', updateUserSettings);
router.put('/:userId/section', updateSectionSettings);
router.get('/:userId/working-hours', getWorkingHours);
router.put('/:userId/working-hours', updateWorkingHours);
router.get('/:userId/notifications', getNotificationSettings);
router.put('/:userId/notifications', updateNotificationSettings);
router.get('/:userId/export', exportSettings);
router.post('/:userId/reset', resetUserSettings);
router.get('/:userId/availability', checkUserAvailability);

module.exports = router;