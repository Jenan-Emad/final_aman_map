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
  //the final state of the hazard
  status: {
    documented: { type: Boolean, default: false },
    reported: { type: Boolean, default: false },
    ended: { type: Boolean, default: false },
    documentedAt: { type: Date },
    reportedAt: { type: Date },
    endedAt: { type: Date },
    documentedCount: { type: Number, default: 0 },
    reportedCount: { type: Number, default: 0 },
    endedCount: { type: Number, default: 0 },
    displayStatus: { type: String, default: "pending" },
  },
  verificationSummary: {
    reportCount: { type: Number, default: 0 },
    documentCount: { type: Number, default: 0 },
    endRequestCount: { type: Number, default: 0 }
  },
  colorCode: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  // relatedReports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }],
});

hazardSchema.index({ geometry: "2dsphere" });

// Gaza simplified polygon (lng, lat)
const GAZA_POLYGON = [
  [34.216, 31.353],
  [34.232, 31.568],
  [34.552, 31.586],
  [34.556, 31.333],
  [34.219, 31.22],
  [34.216, 31.353], // closed polygon
];

//validation functions

//validate hazard location
hazardSchema.statics.pointInGazaPolygon = function (lat, lng) {
  let inside = false;
  for (
    let i = 0, j = GAZA_POLYGON.length - 1;
    i < GAZA_POLYGON.length;
    j = i++
  ) {
    const xi = GAZA_POLYGON[i][0],
      yi = GAZA_POLYGON[i][1];
    const xj = GAZA_POLYGON[j][0],
      yj = GAZA_POLYGON[j][1];

    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
};

//validate crowdSourcing and update the hazard status using priority based system and multi-state system


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
  //for testing puporses we set it to 1 minute
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
          this.status.documentedCount = count;
          break;

        case 'report':
          if (!this.status.reported) {
            this.status.reported = true;
            this.status.reportedAt = timestamp;
          }
          this.status.reportedCount = count;
          break;

        case 'end':
          if (!this.status.ended) {
            this.status.ended = true;
            this.status.endedAt = timestamp;
          }
          this.status.endedCount = count;
          break;
      }
    }
  });
  this.updatedAt = timestamp;

}


export default dbConnection.model("Hazard", hazardSchema);
