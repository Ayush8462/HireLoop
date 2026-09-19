export interface AtsAnalysisResult {
  score: number;
  level: "Needs Work" | "Developing" | "Competitive" | "Placement Ready";
  wordCount: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendations: string[];
}

const CORE_KEYWORDS: readonly string[] = [
  "javascript",
  "typescript",
  "react",
  "node",
  "express",
  "mongodb",
  "sql",
  "postgresql",
  "dsa",
  "algorithms",
  "data structures",
  "system design",
  "api",
  "rest",
  "backend",
  "frontend",
  "full stack",
  "git",
  "docker",
  "aws",
  "ci/cd",
  "testing",
  "jest",
  "microservices",
];

export function calculateAtsScore(rawText: string = ""): AtsAnalysisResult {
  if (!rawText || typeof rawText !== "string") {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: [...CORE_KEYWORDS],
      level: "Needs Work",
      wordCount: 0,
      recommendations: [
        "Upload a detailed PDF resume containing technical skills and project descriptions.",
      ],
    };
  }

  const text = rawText.toLowerCase();
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const keyword of CORE_KEYWORDS) {
    if (text.includes(keyword)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  // Base score from keyword presence (up to 70 pts)
  const keywordRatio = matchedKeywords.length / CORE_KEYWORDS.length;
  let score = Math.round(keywordRatio * 70);

  // Length & depth bonus (up to 20 pts)
  const wordCount = rawText.trim().split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 1200) {
    score += 20;
  } else if (wordCount > 1200) {
    score += 10;
  } else if (wordCount >= 150) {
    score += 10;
  }

  // Formatting & section presence bonus (up to 10 pts)
  const sections = ["education", "experience", "projects", "skills"];
  let sectionHits = 0;
  for (const sec of sections) {
    if (text.includes(sec)) sectionHits++;
  }
  score += Math.round((sectionHits / sections.length) * 10);

  // Cap at 100
  if (score > 100) score = 100;

  let level: AtsAnalysisResult["level"] = "Needs Work";
  if (score >= 80) {
    level = "Placement Ready";
  } else if (score >= 60) {
    level = "Competitive";
  } else if (score >= 40) {
    level = "Developing";
  }

  const recommendations: string[] = [];
  if (missingKeywords.length > 0) {
    recommendations.push(
      `Consider adding relevant skills: ${missingKeywords.slice(0, 5).join(", ")}.`
    );
  }
  if (wordCount < 300) {
    recommendations.push("Your resume is brief. Expand upon project impact and quantified outcomes.");
  }
  if (sectionHits < 3) {
    recommendations.push("Ensure clear section headings: Education, Experience, Projects, and Technical Skills.");
  }

  return {
    score,
    level,
    wordCount,
    matchedKeywords,
    missingKeywords: missingKeywords.slice(0, 8),
    recommendations,
  };
}
