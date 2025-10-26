/**
 * @file server.ts
 * @description Main entry point of the app
 *
 * @module app
 *
 * @author Thomas
 * @version 1.0.0
 *
 */
import app from "./app";
import logger from "./utility/logger";

const port = process.env.PORT || 8040;
app.listen(port, () => logger.info(`Express server has started`));
