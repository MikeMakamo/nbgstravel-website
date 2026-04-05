import { config } from "./config/env.js";
import { createApp } from "./app.js";
import { startSchedulers } from "./services/scheduler.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`NBGSTRAVEL API running on port ${config.port}`);
});

startSchedulers();
