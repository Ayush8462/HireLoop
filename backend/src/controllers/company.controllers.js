import mongoose from "mongoose";
import Company from "../models/company.model.js";
import Roadmap from "../models/roadmap.model.js";
import redisClient from "../config/redis.client.js";

const createCompany = async (req, res) => {
  const { name, roles, avgPackage, difficultyLevel } = req.body;

  try {
    if(!name) {
      return res.status(400).json({message: "Company name is required"});
    }

    const existing = await Company.findOne({ name: req.body.name });
    if (existing) {
      return res.status(409).json({ message: "Company already exists" });
    }

    const company = new Company({
      name,
      roles,
      avgPackage,
      difficultyLevel
    });

    await company.save();
    res.status(201).json({company});
  } catch (err) {
    res.json({message: `Something went wrong ${err}`});
  }
}

const createRoadmap = async (req, res) => {
  const { topics, interviewRounds, preparationTimeline } = req.body;

  try {
    const company = await Company.findOne({name: req.body.companyName});

    if (!company) {
      return res.status(404).json({message: "Company not found"});
    }

    const roadmap = await Roadmap.create({
      companyId: company._id,
      topics,
      interviewRounds,
      preparationTimeline
    });

    // delete cache if exists
    await redisClient.del(`roadmap:v1:${company._id}`);

    res.status(201).json({roadmap});
  } catch (err) {
    res.json({message: `Something went wrong ${err}`});
  }
}

const updateRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    // invalidate cache
    await redisClient.del(`roadmap:v1:${roadmap.companyId}`);

    res.json(roadmap);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findByIdAndDelete(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    // remove cache
    await redisClient.del(`roadmap:v1:${roadmap.companyId}`);

    res.json({ message: "Roadmap deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRoadmap = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({message: "Invalid company ID"});
    }

    const cacheKey = `roadmap:v1:${companyId}`;

    // check redis
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    // fetch from MongoDB
    const roadmap = await Roadmap.findOne({ companyId })
      .populate("companyId")
      .lean();

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    // store in Redis (1 hour TTL)
    await redisClient.set(cacheKey, JSON.stringify(roadmap), {EX: 3600});

    // return response
    res.status(200).json(roadmap);

  } catch (err) {
    res.json({message: `Something went wrong ${err}`});
  }
};

export { createCompany, createRoadmap, updateRoadmap, deleteRoadmap, getRoadmap };
