import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT) || 5003;

app.listen(port, () => {
  console.log(`ATS Service running on port ${port}`);
});
