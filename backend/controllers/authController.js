import catchAsync from "../utils/catchAsync.js";
import { registerUser, loginUser } from "../services/authService.js";

const register = catchAsync(async (req, res) => {
  const result = await registerUser(req.body);

  res.status(201).json({
    status: "success",
    token: result.token,
    data: {
      user: result.user,
    },
  });
});

const login = catchAsync(async (req, res) => {
  const result = await loginUser(req.body);

  res.status(200).json({
    status: "success",
    token: result.token,
    data: {
      user: result.user,
    },
  });
});