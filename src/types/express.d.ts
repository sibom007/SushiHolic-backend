import { User as SupabaseUser } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      user: SupabaseUser;
      // If you also want to type your Prisma user object later:
      // dbUser?: any;
    }
  }
}

// Ensure this is treated as a module
export {};
