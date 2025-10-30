// const DeviceRoute = require("./device");
// const HazardRoutes = require("./hazard");
import addHazardRoute from "./addHazardRoute.js";
import hazardActions from "./hazardActions.js";
import getHazardsRoute from "./getHazardsRoute.js";
import removeHazardRoute from "./removeHazardRoute.js";

export default (app) => {
    app.use("/map", addHazardRoute),
    app.use("/map", hazardActions),
    app.use("/map", getHazardsRoute),
    app.use("/map", removeHazardRoute);
}


