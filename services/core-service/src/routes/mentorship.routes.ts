import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  sendMentorshipRequest,
  getSentRequests,
  getReceivedRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  getConnections,
} from "../controllers/mentorship.controller.js";
import {
  sendMentorshipRequestSchema,
  mentorshipIdSchema,
  paginationQuerySchema,
} from "../validators/mentorship.validator.js";

const router = Router();

router.post(
  "/requests",
  authenticate,
  validate(sendMentorshipRequestSchema),
  sendMentorshipRequest
);

router.get(
  "/requests/sent",
  authenticate,
  validate(paginationQuerySchema),
  getSentRequests
);

router.get(
  "/requests/received",
  authenticate,
  validate(paginationQuerySchema),
  getReceivedRequests
);

router.patch(
  "/requests/:id/accept",
  authenticate,
  validate(mentorshipIdSchema),
  acceptRequest
);

router.patch(
  "/requests/:id/reject",
  authenticate,
  validate(mentorshipIdSchema),
  rejectRequest
);

router.patch(
  "/requests/:id/cancel",
  authenticate,
  validate(mentorshipIdSchema),
  cancelRequest
);

router.get(
  "/connections",
  authenticate,
  validate(paginationQuerySchema),
  getConnections
);

export default router;
