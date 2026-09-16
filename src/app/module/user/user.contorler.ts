import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";


const createUser = catchAsync(async (req, res) => {
  const user = req.user;

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User registered successfully",
    data: user,
  });
});

export const UserControllers = {
  createUser,
};
