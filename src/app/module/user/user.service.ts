import { TAuthUser } from "../../../utils/supabase";


const createUserIntoDB = async (user: TAuthUser) => {
  console.log("🚀 ~ createUserIntoDB ~ user:", user.app_metadata.role)
  
  return { test: "hello" };
};

export const userservise = {
  createUserIntoDB,
};
