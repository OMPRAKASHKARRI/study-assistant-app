export function validateStudyInput(input) {
  if (typeof input !== "string" || input.trim().length === 0) {
    return { valid: false, error: "Please enter some notes or a topic." };
  }
  if (input.length > 10000) {
    return { valid: false, error: "Input must be 10,000 characters or fewer." };
  }
  return { valid: true };
}
