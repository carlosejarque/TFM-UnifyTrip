const Activity = require("../models/Activity");

exports.getActivities = async (req, res) => {
  const rows = await Activity.findAll();
  if (rows.length === 0) {
    return res.status(200).json({ message: "No activities found" });
  }
  const orderedRows = rows.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  res.status(201).json(orderedRows);
};

exports.getActivityById = async (req, res) => {
  const { id } = req.params;
  const activity = await Activity.findByPk(id);
  if (activity) {
    res.json(activity);
  } else {
    res.status(404).json({ message: "Activity not found" });
  }
};

exports.getActivitiesByItineraryId = async (req, res) => {
  const { itinerary_id } = req.params;
  const activities = await Activity.findAll({ where: { itinerary_id } });
  if (activities.length > 0) {
    const orderedActivities = activities.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    res.json(orderedActivities);
  } else {
    res.status(200).json({ message: "No activities found for this itinerary" });
  }
};

exports.createActivity = async (req, res) => {
  const userId = req.user.id;
  const { trip_id, itinerary_id, name, description, start_date, end_date, location, generatedByAI } = req.body;
  
  // DEBUG: Ver qué valores estamos recibiendo
  console.log('=== DEBUG CREATE ACTIVITY ===');
  console.log('userId from req.user.id:', userId);
  console.log('generatedByAI from body:', generatedByAI);
  console.log('typeof generatedByAI:', typeof generatedByAI);
  console.log('generatedByAI === false:', generatedByAI === false);
  console.log('generatedByAI == false:', generatedByAI == false);
  console.log('Full req.body:', req.body);
  
  const createdBy = generatedByAI === false ? userId : null;
  
  console.log('Final createdBy value:', createdBy);
  console.log('==============================');
  
  const activity = await Activity.create({
    trip_id,
    itinerary_id,
    name,
    description,
    start_date,
    end_date,
    created_by: createdBy,
    location,
    generatedByAI
  });
  res.status(201).json({ message: "Activity added successfully", activity });
};

exports.updateActivity = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { trip_id, itinerary_id, name, description, start_date, end_date, location, generatedByAI } = req.body;
  const activity = await Activity.findByPk(id);

  if (activity) {
    // DEBUG: Ver qué valores estamos recibiendo en update
    console.log('=== DEBUG UPDATE ACTIVITY ===');
    console.log('Activity ID:', id);
    console.log('userId from req.user.id:', userId);
    console.log('generatedByAI from body:', generatedByAI);
    console.log('typeof generatedByAI:', typeof generatedByAI);
    console.log('generatedByAI === false:', generatedByAI === false);
    console.log('Full req.body:', req.body);
    
    // Si generatedByAI es false, usar el userId como created_by, sino null
    const createdBy = generatedByAI === false ? userId : null;
    
    console.log('Final createdBy value:', createdBy);
    console.log('==============================');
    
    await activity.update({
      trip_id,
      itinerary_id,
      name,
      description,
      start_date,
      end_date,
      created_by: createdBy,
      location,
      generatedByAI
    });
    res.json({ message: "Activity updated successfully" });
  } else {
    res.status(404).json({ message: "Activity not found" });
  }
};

exports.deleteActivity = async (req, res) => {
  const { id } = req.params;
  const activity = await Activity.findByPk(id);

  if (activity) {
    await activity.destroy();
    res.json({ message: "Activity deleted successfully" });
  } else {
    res.status(404).json({ message: "Activity not found" });
  }
};
