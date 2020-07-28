import swaggerUi from "swagger-ui-express";
import { generate } from "./openapi.js";

const options = {
  customCss: `.swagger-ui .topbar a img {
    content: url(https://dev.zenroom.org/_media/images/zenroom_logo.png);
 } .swagger-ui .topbar { background-color: #dedede } .swagger-ui .scheme-container{display: none}`,
};

export default [
  async (req, res, next) => {
    const rootPath = `./contracts/${req.params.user}`;
    const swaggerDoc = await generate(rootPath);
    swaggerDoc.servers[0].variables.host = { default: req.hostname };
    req.swaggerDoc = swaggerDoc;
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(null, options),
];