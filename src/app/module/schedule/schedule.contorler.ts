import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { scheduleServices } from "./schedule.service";

const createSchedule = catchAsync(async (req, res) => {
  const result = await scheduleServices.createScheduleInToDB(
    req.body,
    req.user,
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule create successfully!",
    data: result,
  });
});

const updateSchedule = catchAsync(async (req, res) => {
  const result = await scheduleServices.updateScheduleInToDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule create successfully!",
    data: result,
  });
});

const deleteSchedule = catchAsync(async (req, res) => {
  const result = await scheduleServices.deleteScheduleInToDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule delete successfully!",
    data: result,
  });
});

const softDeleteSchedule = catchAsync(async (req, res) => {
  const result = await scheduleServices.softDeleteScheduleInToDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Schedule delete successfully!",
    data: result,
  });
});

const getSchedule = catchAsync(async (req, res) => {
  const result = await scheduleServices.getScheduleInToDB(res.locals.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule successfully!",
    data: result,
  });
});

const getCurrentWeekSchedule = catchAsync(async (req, res) => {
  const result = await scheduleServices.getCurrentWeekScheduleInToDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule successfully!",
    data: result,
  });
});

export const scheduleControllers = {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  softDeleteSchedule,
  getSchedule,
  getCurrentWeekSchedule,
};
