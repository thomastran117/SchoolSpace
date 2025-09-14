const app = require("./app");
const logger = require("./utility/logger");
const port = process.env.PORT || 8040;
app.listen(port, () => logger.info(`Express server has started`));
