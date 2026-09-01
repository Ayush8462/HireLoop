import app  from "./app.js";

import {
  connectDatabase,
} from "./config/database.js";

import { env } from "./config/env.js";

async function bootstrap() {
  await connectDatabase();

  const server =
    app.listen(
      env.PORT,
      () => {
        console.log(
          `🚀 Auth Service running on port ${env.PORT}`
        );
      }
    );

}

bootstrap().catch(
  (error) => {
    console.error(
      "Failed to start Auth Service",
      error
    );

    process.exit(1);
  }
);