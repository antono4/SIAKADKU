import {
  computeFinalScore,
  scoreToGrade,
  gradeToWeight,
  type GradeComponents,
  type GradeLetter,
} from '@siakad/shared';

export { computeFinalScore, scoreToGrade, gradeToWeight };
export type { GradeComponents, GradeLetter };

/**
 * Apply the legacy STIE Pertiba grading rubric to raw score components and
 * return the final score, letter grade and weight, ready to persist.
 */
export function evaluateGrade(components: GradeComponents) {
  const finalScore = Math.round(computeFinalScore(components) * 100) / 100;
  const grade = scoreToGrade(finalScore);
  const weight = gradeToWeight(grade);
  return { finalScore, grade, weight };
}
