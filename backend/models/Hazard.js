import dbConnection from "../config/index.js";
import mongoose from "mongoose";

const ACTION_PRIORITY = {
  document: 3,
  report: 2,
  end: 1
};

const hazardSchema = new mongoose.Schema({
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: (v) => v.length == 2,
        message: (props) => `${props.value} must be [lng, lat]`,
      },
      required: true,
    },
  },
  dangerType: {
    type: String,
    enum: ["airstrike", "artillery", "naval_shelling", "other"],
    required: true
  },

  status: {
    documented: { type: Boolean, default: false },
    reported: { type: Boolean, default: false },
    ended: { type: Boolean, default: false },
    documentedAt: { type: Date },
    reportedAt: { type: Date },
    endedAt: { type: Date },
    displayStatus: { type: String, default: "pending" },
  },
  verificationSummary: {
    reportCount: { type: Number, default: 0 },
    documentCount: { type: Number, default: 0 },
    endRequestCount: { type: Number, default: 0 }
  },
  colorCode: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

hazardSchema.index({ geometry: "2dsphere" });


//validation functions

//validate hazard location
hazardSchema.statics.pointInGazaPolygon = function (lat, lng) {
  const gazaBounds = {
    north: 31.59,
    south: 31.22,
    east: 34.57,
    west: 34.22
  };
  
  const inBoundingBox = 
    lat >= gazaBounds.south && 
    lat <= gazaBounds.north && 
    lng >= gazaBounds.west && 
    lng <= gazaBounds.east;
  
  if (!inBoundingBox) {
    return false;
  }
  
  const gazaPolygon = [
    [31.59, 34.49],
    [31.52, 34.49],
    [31.47, 34.44],
    [31.42, 34.39],
    [31.38, 34.37],
    [31.35, 34.35],
    [31.31, 34.33],
    [31.28, 34.31],
    [31.22, 34.25],
    [31.22, 34.22],
    [31.25, 34.22],
    [31.28, 34.22],
    [31.35, 34.22],
    [31.42, 34.22],
    [31.47, 34.22],
    [31.52, 34.22],
    [31.59, 34.28]
  ];
  
  return isPointInPolygon(lat, lng, gazaPolygon);
}

function isPointInPolygon(lat, lng, polygon) {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lati, lngi] = polygon[i];
    const [latj, lngj] = polygon[j];
    
    const intersect = ((lngi > lng) !== (lngj > lng)) &&
      (lat < (latj - lati) * (lng - lngi) / (lngj - lngi) + lati);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
};

//validate crowdSourcing and update the hazard status using priority based system and multi-state system
//crowdSourcing validation
hazardSchema.methods.resolveHazardStatus = async function () {
  const verificationCounts = {
    document: this.verificationSummary.documentCount,
    report: this.verificationSummary.reportCount,
    end: this.verificationSummary.endRequestCount
  }
  const now = new Date();

  //update multi-state first
  this.updateMultiState(verificationCounts);

  // Determine qualified actions that reached verification threshold (>= 5)
  const qualifiedActions = Object.entries(verificationCounts)
    .filter(([action, count]) => count >= 5)
    .map(([action]) => action);

  //If no actions reached threshold, return current status
  if (qualifiedActions.length === 0) {
    this.status.pending = true;
    if (!this.status.displayStatus) {
      this.status.displayStatus = 'pending';
    }
    return this.status;
  }

  // Find highest priority action
  let resolvedAction = qualifiedActions.reduce((highest, current) => {
    return ACTION_PRIORITY[current] > ACTION_PRIORITY[highest] ? current : highest;
  });

  // ⚠️ Allow "end" only if hazard has been documented for >= 1 day (24h)
  // const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  //for testing purpose we set it to 1 minute
  const test_time_MS = 1 * 60 * 1000; // 1 minute for testing
  // const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours for production
  const canEndSafely =
    qualifiedActions.includes("end") &&
    this.status.documented &&
    this.status.documentedAt &&
    now - new Date(this.status.documentedAt) > test_time_MS;

  if (canEndSafely) {
    resolvedAction = "end";
  }

  // Update display status based on resolved action
  this.updateDisplayStatus(resolvedAction);

  return this.status;

}

//helper functions

hazardSchema.methods.updateDisplayStatus = function (resolvedAction) {
  switch (resolvedAction) {
    case 'document':
      this.status.displayStatus = 'documented 📄';
      break;
    case 'report':
      this.status.displayStatus = 'reported ❗';
      break;
    case 'end':
      this.status.displayStatus = 'Hazard Ended ✅';
      break;
    default:
      this.status.displayStatus = 'pending';
  }
}

hazardSchema.methods.updateMultiState = async function (verificationCounts) {
  const counts = verificationCounts || {};
  const timestamp = new Date().toISOString();
  // Update ALL actions that reached verification threshold (>= 5)
  Object.entries(counts).forEach(([action, count]) => {
    if (count >= 5) {
      switch (action) {
        case 'document':
          if (!this.status.documented) {
            this.status.documented = true;
            this.status.documentedAt = timestamp;
          }
          break;

        case 'report':
          if (!this.status.reported) {
            this.status.reported = true;
            this.status.reportedAt = timestamp;
          }
          break;

        case 'end':
          if (!this.status.ended) {
            this.status.ended = true;
            this.status.endedAt = timestamp;
          }
          break;
      }
    }
  });
  this.updatedAt = timestamp;

}


export default dbConnection.model("Hazard", hazardSchema);
