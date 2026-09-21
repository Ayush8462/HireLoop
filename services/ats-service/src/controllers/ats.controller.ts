import { Request, Response } from "express";
import { extractTextFromPDF } from "../services/pdf.service.js";
import { calculateAtsScore } from "../services/ats.service.js";

export const scoreText = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { text } = req.body as { text?: string };
    if (!text) {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    const result = calculateAtsScore(text);
    return res.status(200).json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return res.status(500).json({ success: false, message });
  }
};

export const uploadAndScoreResume = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No PDF file uploaded" });
    }

    const text = await extractTextFromPDF(req.file.buffer);
    const analysis = calculateAtsScore(text);

    return res.status(200).json({
      success: true,
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        extractedTextPreview: text.substring(0, 300) + "...",
        ...analysis,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return res.status(500).json({ success: false, message });
  }
};

export const scoreResumeUrl = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { url } = req.body as { url?: string };
    if (!url) {
      return res.status(400).json({ success: false, message: "Resume URL is required" });
    }

    let buffer: Buffer;
    if (url.startsWith("data:application/pdf;base64,")) {
      const base64Data = url.replace("data:application/pdf;base64,", "");
      buffer = Buffer.from(base64Data, "base64");
    } else {
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(400).json({ success: false, message: "Failed to download PDF from URL" });
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    const text = await extractTextFromPDF(buffer);
    const analysis = calculateAtsScore(text);

    return res.status(200).json({
      success: true,
      data: {
        fileUrl: url,
        fileSize: buffer.length,
        extractedTextPreview: text.substring(0, 300) + "...",
        ...analysis,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return res.status(500).json({ success: false, message });
  }
};

