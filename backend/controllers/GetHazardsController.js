import Hazard from "../models/Hazard.js";

const getAllHazards = async (req, res, next) => {
  try {
    // Get all active hazards
    const hazards = await Hazard.find({
      'status.displayStatus': { $ne: 'false_report' }
    }).sort({ updatedAt: -1 });

    // Transform data for frontend
    const transformedHazards = hazards.map(hazard => ({
      _id: hazard._id,
      geometry: hazard.geometry,
      dangerType: hazard.dangerType,
      colorCode: hazard.colorCode,
      description: hazard.description || '',
      area: hazard.area || determineArea(hazard.geometry.coordinates),
      status: hazard.status,
      verificationSummary: hazard.verificationSummary,
      createdAt: hazard.createdAt || hazard.updatedAt,
      updatedAt: hazard.updatedAt,
      radius: 200 // Default radius
    }));

    res.status(200).json({
      success: true,
      data: transformedHazards
    });
  } catch (err) {
    console.error('Error fetching hazards:', err);
    next(err);
  }
};

// Helper function to determine area based on coordinates
const determineArea = (coordinates) => {
  const [lng, lat] = coordinates;
  
  if (lat > 31.52) return 'شمال غزة';
  if (lat > 31.45) return 'غزة';
  if (lat > 31.35) return 'الوسطى';
  if (lat > 31.25) return 'خان يونس';
  return 'رفح';
};

export { getAllHazards };