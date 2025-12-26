/**
 * Type definitions for DynamicSyntenyAdapter
 * Schema based on macro-synteny-paf JSON format
 */

/**
 * Query or target sequence information
 */
export interface SequenceInfo {
  name: string
  length: number
  start: number
  end: number
}

/**
 * Alignment from API response (macro-synteny-paf format)
 */
export interface AlignmentData {
  query: SequenceInfo
  target: SequenceInfo
  strand: '+' | '-'
  numResidueMatches: number
  alignmentBlockLength: number
  mappingQuality: number
}

/**
 * API response format (macro-synteny-paf)
 */
export interface MacroSyntenyResponse {
  alignments: AlignmentData[]
}

/**
 * Generic API response format (for backwards compatibility)
 */
export interface GenericApiResponse {
  features?: any[]
  alignments?: AlignmentData[]
  [key: string]: any
}

/**
 * Mate information for synteny features
 */
export interface MateInfo {
  refName: string
  start: number
  end: number
  assemblyName?: string
}

/**
 * Parsed synteny feature (JBrowse internal format)
 */
export interface ParsedSyntenyFeature {
  uniqueId: string
  refName: string
  start: number
  end: number
  assemblyName?: string
  strand: number
  mate: MateInfo
  type: string
  name?: string
  numResidueMatches?: number
  alignmentBlockLength?: number
  mappingQuality?: number
  [key: string]: any
}
