import { Router } from "express";
import { addFeedback, bookInterview, cancelInterview, completeInterview, createSlot, getInterviewStats, getSeniorInterviewHistory, getStudentInterviewHistory } from "../controllers/interview.controller.js";
import authMiddleware from "../middlewares/auth.middlewares.js"
import roleMiddleware from "../middlewares/role.middleware.js"

const router = Router();

router.post("/slot/create", authMiddleware, roleMiddleware("senior"), createSlot);

router.post("/book", authMiddleware, roleMiddleware("student"), bookInterview)

router.put("/booking/complete/:id", authMiddleware, completeInterview)

router.put("/booking/cancel/:id", authMiddleware, cancelInterview )

router.post("/booking/feedback/:id", authMiddleware, roleMiddleware("senior"), addFeedback)

router.get( "/student/history",  authMiddleware,  roleMiddleware("student"),  getStudentInterviewHistory)

router.get( "/senior/history", authMiddleware, roleMiddleware("senior"), getSeniorInterviewHistory)

router.get("/admin/stats", authMiddleware, roleMiddleware("admin"), getInterviewStats)

export default router;