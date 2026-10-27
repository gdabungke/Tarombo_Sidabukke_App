import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";

// Ganti 5000 ke 5001 agar tidak bentrok dengan AirPlay macOS
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server maringan di http://localhost:${PORT}`);
});