import pdfParse from "pdf-parse";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("Uploaded file buffer is empty or invalid.");
  }

  try {
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to extract text from PDF: ${message}`);
  }
}
