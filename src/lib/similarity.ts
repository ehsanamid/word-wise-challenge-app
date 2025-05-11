
/**
 * Calculate the Levenshtein distance between two strings
 * @param a First string
 * @param b Second string
 * @returns The edit distance between the strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score between two strings (0-100)
 * @param userInput User's answer 
 * @param correctAnswer Correct answer
 * @returns Score from 0 to 100
 */
export function calculateSimilarity(userInput: string, correctAnswer: string): number {
  // Normalize strings: trim, lowercase
  const normalizedInput = userInput.trim().toLowerCase();
  const normalizedAnswer = correctAnswer.trim().toLowerCase();
  
  if (normalizedInput === normalizedAnswer) {
    return 100; // Perfect match
  }
  
  if (normalizedInput.length === 0) {
    return 0; // Empty input
  }
  
  const maxLength = Math.max(normalizedInput.length, normalizedAnswer.length);
  const distance = levenshteinDistance(normalizedInput, normalizedAnswer);
  
  // Convert distance to similarity score (0-100)
  let similarity = Math.max(0, Math.round((1 - distance / maxLength) * 100));
  
  // Cap similarity at 100
  return Math.min(similarity, 100);
}
