import { VoiceEntry, ProcessedResult } from './types.js'

/**
 * processEntries
 * --------------
 * PURE function — no IO, no mutation, deterministic.
 */
export function processEntries(entries: VoiceEntry[]): ProcessedResult {
  // Handle empty input
  if (!entries || entries.length === 0) {
    return {
      summary: 'No entries to analyze',
      tagFrequencies: {},
    }
  }

  // Count tag frequencies from both user and model tags
  const tagFrequencies: Record<string, number> = {}
  
  // Track additional metrics for enhanced summary
  const languageCount: Record<string, number> = {}
  const categoryCount: Record<string, number> = {}
  let emotionScoreSum = 0
  let emotionScoreCount = 0
  let entriesWithAudio = 0
  let entriesWithEmbedding = 0
  
  // Find date range
  let earliestDate: Date | null = null
  let latestDate: Date | null = null

  for (const entry of entries) {
    // Process user tags
    if (entry.tags_user && Array.isArray(entry.tags_user)) {
      for (const tag of entry.tags_user) {
        if (tag && typeof tag === 'string') {
          tagFrequencies[tag] = (tagFrequencies[tag] || 0) + 1
        }
      }
    }

    // Process model tags
    if (entry.tags_model && Array.isArray(entry.tags_model)) {
      for (const tag of entry.tags_model) {
        if (tag && typeof tag === 'string') {
          tagFrequencies[tag] = (tagFrequencies[tag] || 0) + 1
        }
      }
    }

    // Track language distribution
    if (entry.language_detected) {
      languageCount[entry.language_detected] = (languageCount[entry.language_detected] || 0) + 1
    }

    // Track category distribution
    if (entry.category) {
      categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1
    }

    // Aggregate emotion scores
    if (entry.emotion_score_score !== null && entry.emotion_score_score !== undefined) {
      emotionScoreSum += entry.emotion_score_score
      emotionScoreCount++
    }

    // Count entries with audio
    if (entry.audio_url) {
      entriesWithAudio++
    }

    // Count entries with embeddings
    if (entry.embedding && Array.isArray(entry.embedding) && entry.embedding.length > 0) {
      entriesWithEmbedding++
    }

    // Track date range
    if (entry.created_at) {
      const entryDate = new Date(entry.created_at)
      if (!isNaN(entryDate.getTime())) {
        if (!earliestDate || entryDate < earliestDate) {
          earliestDate = entryDate
        }
        if (!latestDate || entryDate > latestDate) {
          latestDate = entryDate
        }
      }
    }
  }

  // Calculate average emotion score
  const avgEmotionScore = emotionScoreCount > 0 ? emotionScoreSum / emotionScoreCount : null

  // Build comprehensive summary
  const totalEntries = entries.length
  const totalTags = Object.keys(tagFrequencies).length
  const totalLanguages = Object.keys(languageCount).length
  const totalCategories = Object.keys(categoryCount).length

  let summary = `Analyzed ${totalEntries} entries`
  
  if (totalTags > 0) {
    const mostCommonTag = Object.entries(tagFrequencies)
      .sort(([, a], [, b]) => b - a)[0]
    summary += ` with ${totalTags} unique tags (most common: "${mostCommonTag[0]}" - ${mostCommonTag[1]} occurrences)`
  }

  if (totalLanguages > 0) {
    summary += `, ${totalLanguages} language(s)`
  }

  if (totalCategories > 0) {
    summary += `, ${totalCategories} categories`
  }

  if (avgEmotionScore !== null) {
    summary += `, average emotion score: ${avgEmotionScore.toFixed(2)}`
  }

  if (entriesWithAudio > 0) {
    summary += `, ${entriesWithAudio} with audio`
  }

  if (entriesWithEmbedding > 0) {
    summary += `, ${entriesWithEmbedding} with embeddings`
  }

  if (earliestDate && latestDate) {
    const daySpan = Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24))
    summary += `, spanning ${daySpan} days`
  }

  return {
    summary,
    tagFrequencies,
  }
}

export default processEntries 