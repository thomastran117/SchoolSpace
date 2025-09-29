/**
 * @file server.js
 * @description Main entry point of the app
 *
 * @module app
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

import app from "./app.js";
import logger from "./utility/logger.js";
const port = process.env.PORT || 8040;
app.listen(port, () => logger.info(`Express server has started`));
