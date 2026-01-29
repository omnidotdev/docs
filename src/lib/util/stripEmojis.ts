// TODO: Strip characters intelligently (e.g. detect unsupported glyphs dynamically)
/**
 * Strip emojis and symbols from text.
 * Useful for OG titles where emoji fonts are unreliable.
 * @param text Input text.
 */
const stripEmojis = (text: string): string => {
  return text
    .replace(
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2200}-\u{22FF}]|[\u{2300}-\u{23FF}]/gu,
      "",
    )
    .trim();
};

export default stripEmojis;
