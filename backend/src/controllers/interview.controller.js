import { InterviewSlot } from "../models/interviewSlot.model.js";
import httpStatus from "http-status";
import { InterviewBooking } from "../models/interviewBooking.model.js";



export const createSlot = async (req,res)=>{

    try{
        const { date, startTime, endTime } = req.body;

        const existingSlot = await InterviewSlot.findOne({
            seniorId: req.user.id,
            date,
            startTime,
            endTime
        });

        if (existingSlot) {
            return res.status(httpStatus.CONFLICT).json({message: "Slot Already Exist"});
        }

        const slot = await InterviewSlot.create({
            seniorId: req.user.id,
            date,
            startTime,
            endTime
        });

        res.status(httpStatus.CREATED).json({message: "Slot created Successfully"})
    }
    catch(err){
        res.json({message: `Something went wrong ${err}`});
    }
}


export const bookInterview = async(req,res) =>{
     try {
        const { slotId } = req.body;

        const slot = await InterviewSlot.findById(slotId);

    if (!slot) {
      return res.status(httpStatus.NOT_FOUND).json({message: "Slot not found"});
    }

    if (slot.isBooked) {
      return res.status(httpStatus.CONFLICT).json({ message: "Slot already booked"  });
    
    }

     const booking = await InterviewBooking.create({
      studentId: req.user.id,
      seniorId: slot.seniorId,
      slotId: slot._id
    });

   
    slot.isBooked = true;
    await slot.save();

     res.status(httpStatus.CREATED).json({message: "Interview Booked Successfully"})

    }
    catch(err){
        res.status(500).json({message: `Something went wrong ${err}`});
    }
}


export const completeInterview = async (req,res)=>{

    try{

        const booking = await InterviewBooking.findById(req.params.id);

        if(!booking){
            return  res.status(httpStatus.NOT_FOUND).json({ message:"Booking NOt Found" });
        }

        if(booking.status != "scheduled"){
            return res.status(httpStatus.BAD_REQUEST).json({ message:"Only Scheduled interviews can be completed" })
        }

        booking.status="completed";
        await booking.save();

        res.status(httpStatus.CREATED).json({message: "Interview Completed Successfully"})

    }
    catch(err){
        res.status(500).json({message: `Something went wrong ${err}`});
    }
}


export const cancelInterview = async (req,res)=>{

    try{

        const booking = await InterviewBooking.findById(req.params.id);

        if(!booking){
            return  res.status(httpStatus.NOT_FOUND).json({ message:"Booking Not Found" });
        }

        if(booking.status !== "scheduled" ){
            return res.status(httpStatus.BAD_REQUEST).json({ message:"Cannot Cancel Unscheduled Interview" })
        }

        const slot = await InterviewSlot.findById(booking.slotId);

         if (!slot) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Slot Not Found" });
        }
        slot.isBooked = false;
        booking.status="cancelled"

        await slot.save();
        await booking.save();

        res.status(httpStatus.OK).json({message: "Interview Cancelled Successfully"})
    }
    catch(err){
        res.status(500).json({message: `Something went wrong ${err}`});
    }
}


export const addFeedback = async (req, res) => {
    try {
        const bookingId = req.params.id

        const booking = await InterviewBooking.findById(bookingId)

        if (!booking) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Booking Not Found"
            })
        }

        if (booking.status !== "completed") {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: "Interview not completed yet"
            })
        }

        if (booking.seniorId.toString() !== req.user.id) {
            return res.status(httpStatus.FORBIDDEN).json({
                message: "Unauthorized"
            })
        }

        if (booking.feedback && booking.feedback.technicalRating) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: "Feedback already submitted"
            })
        }

        const {
            technicalRating,
            communicationRating,
            problemSolvingRating,
            strengths,
            improvements
        } = req.body

        if (
            technicalRating < 1 || technicalRating > 5 ||
            communicationRating < 1 || communicationRating > 5 ||
            problemSolvingRating < 1 || problemSolvingRating > 5
        ) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: "Ratings must be between 1 and 5"
            })
        }

        booking.feedback = {
            technicalRating,
            communicationRating,
            problemSolvingRating,
            strengths,
            improvements
        }

        await booking.save()

        res.status(httpStatus.OK).json({
            message: "Feedback submitted successfully",
            
        })

    } catch (err) {
        res.status(500).json({
            message: `Something went wrong ${err}`
        })
    }
}



export const getStudentInterviewHistory = async (req, res) => {
    try {

        const interviews = await InterviewBooking.find({
            studentId: req.user.id
        })
        .populate("seniorId", "name email")  
        .populate("slotId", "date startTime endTime") 
        .sort({ createdAt: -1 }) 

        if (!interviews.length) {
            return res.status(httpStatus.OK).json({
                message: "No interviews found",
                data: []
            })
        }

        res.status(httpStatus.OK).json({
            message: "Interview history fetched successfully",
            data: interviews
        })

    } catch (err) {
        res.status(500).json({
            message: `Something went wrong ${err}`
        })
    }
}


export const getSeniorInterviewHistory = async (req, res) => {
    try {

        const interviews = await InterviewBooking.find({
            seniorId: req.user.id
        })
        .populate("studentId", "name email") 
        .populate("slotId", "date startTime endTime") 
        .sort({ createdAt: -1 })

        if (!interviews.length) {
            return res.status(httpStatus.OK).json({
                message: "No interviews found",
                data: []
            })
        }

        res.status(httpStatus.OK).json({
            message: "Senior interview history fetched successfully",
            data: interviews
        })

    } catch (err) {
        res.status(500).json({
            message: `Something went wrong ${err}`
        })
    }
}



export const getInterviewStats = async (req, res) => {
    try {

        const total = await InterviewBooking.countDocuments()

        const completed = await InterviewBooking.countDocuments({
            status: "completed"
        })

        const cancelled = await InterviewBooking.countDocuments({
            status: "cancelled"
        })

        const scheduled = await InterviewBooking.countDocuments({
            status: "scheduled"
        })

        const completionRate =
            total === 0 ? 0 : ((completed / total) * 100).toFixed(2)

        res.status(httpStatus.OK).json({
            total,
            completed,
            cancelled,
            scheduled,
            completionRate
        })

    } catch (err) {
        res.status(500).json({
            message: `Something went wrong ${err}`
        })
    }
}




