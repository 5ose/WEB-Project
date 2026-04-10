import catchAsync from "../utils/catchAsync.js";
import { registerUser, loginUser } from "../services/authService.js";

const register = catchAsync(async (req, res) => {
  const result = await registerUser(req.body);

  res.cookie("token", result.token, {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    status: "success",
    data: {
      user: result.user,
    },
  });
});

const login = catchAsync(async (req, res) => {
  const result = await loginUser(req.body);

  res.cookie("token", result.token, {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    status: "success",
    data: {
      user: result.user,
    },
  });
});

export { register, login };