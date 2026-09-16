import config from "../config";
import { createClient, User, UserAppMetadata } from "@supabase/supabase-js";
import { UserRole } from "../generated/prisma/client";

export const supabase = createClient(
  config.supabase_url,
  config.supabase_publishable_key,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

export type TAuthUser = Omit<User, "app_metadata"> & {
  app_metadata: UserAppMetadata & {
    role?: UserRole;
  };
};
