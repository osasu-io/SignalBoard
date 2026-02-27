export function parseInputText(text: string): string[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [text.trim()].filter(Boolean);
  }

  return lines;
}
