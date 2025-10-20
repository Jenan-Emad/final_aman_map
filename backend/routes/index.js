// const DeviceRoute = require("./device");
// const HazardRoutes = require("./hazard");
import addHazardRoute from "./addHazardRoute.js";
import hazardActions from "./hazardActions.js";
import getHazardsRoute from "./getHazardsRoute.js";

export default (app) => {
    // app.use("/hazards", HazardRoutes),
    // app.use("/devices", require("./device")),
    // app.use("/logs", require("./log")),
    // app.use("/reports", require("./report")),
    app.use("/map", addHazardRoute),
    app.use("/map", hazardActions),
    // Get all hazards
    app.use("/map", getHazardsRoute);
}


