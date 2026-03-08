/**
 * Target Word Count Pipeline
 *
 * Defines the total story word count target and derives chapter-level
 * word budgets based on the target.
 * Also classifies the story format:
 *   ≤ 1000      → flash fiction
 *   1001–7500   → short story
 *   7501–20000  → novelette
 *   20001–50000 → novella
 *   50001+      → novel
 */

export function targetWordCountPipeline(params, context) {
  const wordCount = params.targetWordCount || 3000

  if (!context.technical) {
    context.technical = {}
  }

  let format
  let recommendedChapters

  if (wordCount <= 1000) {
    format = "flash-fiction"
    recommendedChapters = 1
  } else if (wordCount <= 7500) {
    format = "short-story"
    recommendedChapters = Math.max(1, Math.round(wordCount / 1500))
  } else if (wordCount <= 20000) {
    format = "novelette"
    recommendedChapters = Math.max(3, Math.round(wordCount / 2500))
  } else if (wordCount <= 50000) {
    format = "novella"
    recommendedChapters = Math.max(8, Math.round(wordCount / 3000))
  } else {
    format = "novel"
    recommendedChapters = Math.max(15, Math.round(wordCount / 3500))
  }

  const wordsPerChapter = Math.round(wordCount / recommendedChapters)

  context.technical.wordCount = {
    target: wordCount,
    format: format,
    recommendedChapters: recommendedChapters,
    wordsPerChapter: wordsPerChapter,
    guidance: "Aim for approximately " + wordsPerChapter + " words per chapter across " + recommendedChapters + " chapters"
  }

  return context
}
