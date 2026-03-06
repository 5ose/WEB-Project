import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// TEMP: In later phases you'll fetch real user from DB.
// For now, embed role in token payload for testing admin endpoint.
const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please provide a token.", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Attach to request
  req.user = decoded; // { id, role, iat, exp }
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }
    next();
  };
};

export { protect, restrictTo };