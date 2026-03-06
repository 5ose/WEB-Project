import { getBasicHealth, getDetailedHealth } from "../services/healthService.js";
import catchAsync from "../utils/catchAsync.js";

const getHealth = catchAsync(async (req, res) => {
  console.log("Received health check request"); // TEST
  const data = getBasicHealth();
  console.log("Health check:", data); // TEST
  res.status(200).json({ status: "success", data });
});

const getAdminHealth = catchAsync(async (req, res) => {
  console.log("Received admin health check request"); // TEST
  const data = getDetailedHealth();
  console.log("Admin health check:", data);
  res.status(200).json({ status: "success", data }); // TEST
});

export { getHealth, getAdminHealth };