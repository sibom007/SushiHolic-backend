import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });

export default {
  node_prosses: process.env.NODE_PROSSES,
  port: process.env.PORT,
  cors_url: process.env.CORS_URL!,
  supabase_url: process.env.SUPABASE_URL!,
  supabase_publishable_key: process.env.SUPABASE_PUBLISHABLE_KEY!,
};
