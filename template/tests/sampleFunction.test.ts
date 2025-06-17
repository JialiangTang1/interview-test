// eslint-disable-next-line import/no-extraneous-dependencies
// @ts-expect-error vitest types are provided via tsconfig "types"
import { describe, it, expect } from 'vitest'
import { mockVoiceEntries } from '../src/lib/mockData.js'
import processEntries from '../src/lib/sampleFunction.js'
import { VoiceEntry } from '../src/lib/types.js'

describe('processEntries', () => {
  it('counts reflection tag correctly with mock data', () => {
    const result = processEntries(mockVoiceEntries)
    expect(result.tagFrequencies.reflection).toBe(mockVoiceEntries.length)
    expect(result.summary).toContain(`Analyzed ${mockVoiceEntries.length} entries`)
  })

  it('handles empty array', () => {
    const result = processEntries([])
    expect(result.summary).toBe('No entries to analyze')
    expect(result.tagFrequencies).toEqual({})
  })

  it('handles null/undefined input', () => {
    const result = processEntries(null as any)
    expect(result.summary).toBe('No entries to analyze')
    expect(result.tagFrequencies).toEqual({})
  })

  it('counts user tags correctly', () => {
    const testEntries: VoiceEntry[] = [
      {
        id: '1',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['work', 'stress'],
        category: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      },
      {
        id: '2',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['work', 'meeting'],
        category: null,
        created_at: '2023-01-02T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      }
    ]

    const result = processEntries(testEntries)
    expect(result.tagFrequencies.work).toBe(2)
    expect(result.tagFrequencies.stress).toBe(1)
    expect(result.tagFrequencies.meeting).toBe(1)
  })

  it('counts model tags correctly', () => {
    const testEntries: VoiceEntry[] = [
      {
        id: '1',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: ['auto-tagged', 'positive'],
        tags_user: [],
        category: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      }
    ]

    const result = processEntries(testEntries)
    expect(result.tagFrequencies['auto-tagged']).toBe(1)
    expect(result.tagFrequencies.positive).toBe(1)
  })

  it('combines user and model tags', () => {
    const testEntries: VoiceEntry[] = [
      {
        id: '1',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: ['positive'],
        tags_user: ['positive', 'work'],
        category: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      }
    ]

    const result = processEntries(testEntries)
    expect(result.tagFrequencies.positive).toBe(2) // From both user and model
    expect(result.tagFrequencies.work).toBe(1)
  })

  it('handles entries with emotion scores', () => {
    const testEntries: VoiceEntry[] = [
      {
        id: '1',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['happy'],
        category: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        emotion_score_score: 0.8,
        embedding: null,
      },
      {
        id: '2',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['sad'],
        category: null,
        created_at: '2023-01-02T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        emotion_score_score: 0.2,
        embedding: null,
      }
    ]

    const result = processEntries(testEntries)
    expect(result.summary).toContain('average emotion score: 0.50')
  })

  it('handles entries with audio URLs', () => {
    const testEntries: VoiceEntry[] = [
      {
        id: '1',
        user_id: 'test',
        audio_url: 'https://example.com/audio.mp3',
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['audio'],
        category: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      }
    ]

    const result = processEntries(testEntries)
    expect(result.summary).toContain('1 with audio')
  })

  it('handles entries with embeddings', () => {
    const testEntries: VoiceEntry[] = [
      {
        id: '1',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['embedded'],
        category: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        emotion_score_score: null,
        embedding: [0.1, 0.2, 0.3],
      }
    ]

    const result = processEntries(testEntries)
    expect(result.summary).toContain('1 with embeddings')
  })

  it('counts multiple languages', () => {
    const testEntries: VoiceEntry[] = [
      {
        id: '1',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['english'],
        category: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      },
      {
        id: '2',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'es',
        language_rendered: 'es',
        tags_model: [],
        tags_user: ['spanish'],
        category: null,
        created_at: '2023-01-02T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      }
    ]

    const result = processEntries(testEntries)
    expect(result.summary).toContain('2 language(s)')
  })

  it('counts categories', () => {
    const testEntries: VoiceEntry[] = [
      {
        id: '1',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['work'],
        category: 'professional',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      },
      {
        id: '2',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['personal'],
        category: 'personal',
        created_at: '2023-01-02T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      }
    ]

    const result = processEntries(testEntries)
    expect(result.summary).toContain('2 categories')
  })

  it('calculates date span correctly', () => {
    const testEntries: VoiceEntry[] = [
      {
        id: '1',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['first'],
        category: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      },
      {
        id: '2',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['last'],
        category: null,
        created_at: '2023-01-08T00:00:00Z', // 7 days later
        updated_at: '2023-01-08T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      }
    ]

    const result = processEntries(testEntries)
    expect(result.summary).toContain('spanning 7 days')
  })

  it('handles invalid dates gracefully', () => {
    const testEntries: VoiceEntry[] = [
      {
        id: '1',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['test'],
        category: null,
        created_at: 'invalid-date',
        updated_at: 'invalid-date',
        emotion_score_score: null,
        embedding: null,
      }
    ]

    const result = processEntries(testEntries)
    expect(result.summary).not.toContain('spanning')
  })

  it('handles null/undefined/empty tags gracefully', () => {
    const testEntries: VoiceEntry[] = [
      {
        id: '1',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: null as any,
        tags_user: undefined as any,
        category: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      },
      {
        id: '2',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: ['', null, undefined] as any,
        tags_user: ['valid-tag', ''],
        category: null,
        created_at: '2023-01-02T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      }
    ]

    const result = processEntries(testEntries)
    expect(result.tagFrequencies['valid-tag']).toBe(1)
    expect(result.tagFrequencies['']).toBeUndefined()
  })

  it('handles empty embeddings gracefully', () => {
    const testEntries: VoiceEntry[] = [
      {
        id: '1',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['test'],
        category: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        emotion_score_score: null,
        embedding: [], // Empty array
      }
    ]

    const result = processEntries(testEntries)
    expect(result.summary).not.toContain('with embeddings')
  })

  it('identifies most common tag in summary', () => {
    const testEntries: VoiceEntry[] = [
      {
        id: '1',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['frequent', 'rare'],
        category: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      },
      {
        id: '2',
        user_id: 'test',
        audio_url: null,
        transcript_raw: 'test',
        transcript_user: 'test',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['frequent'],
        category: null,
        created_at: '2023-01-02T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        emotion_score_score: null,
        embedding: null,
      }
    ]

    const result = processEntries(testEntries)
    expect(result.summary).toContain('most common: "frequent" - 2 occurrences')
  })
})
