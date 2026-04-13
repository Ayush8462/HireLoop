import { PDFParse } from "pdf-parse";

const extractTextFromPDF = async (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("Uploaded file buffer is empty.");
  }

  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text ?? "";
  } catch (error) {
    throw new Error(
      `Failed to extract text from PDF: ${error.message || "Invalid or unsupported PDF document."}`
    );
  } finally {
    await parser.destroy();
  }
};

export default extractTextFromPDF;
