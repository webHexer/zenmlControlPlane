import app from "./app";
import { connectDB } from "./config/db";
import { config } from "./config/env";

const PORT = config.port;

// Connect to the database
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
