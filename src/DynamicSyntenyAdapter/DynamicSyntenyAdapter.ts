import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter'
import { Region } from '@jbrowse/core/util/types'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'
import { readConfObject } from '@jbrowse/core/configuration'
import { Feature } from '@jbrowse/core/util'
import SimpleFeature from '@jbrowse/core/util/simpleFeature'
import { MacroSyntenyResponse, AlignmentData } from './types'

interface CacheEntry {
  features: Feature[]
  timestamp: number
}

/**
 * Get nested value from object using dot notation
 * @example getNestedValue({ query: { name: 'chr1' } }, 'query.name') => 'chr1'
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * DynamicSyntenyAdapter - Fetches synteny data from REST API endpoints
 *
 * This adapter is designed for macro-synteny PAF format data and works with:
 * - Dotplot View
 * - Linear Synteny View
 *
 * Expected API response format:
 * {
 *   "alignments": [
 *     {
 *       "query": { "name": "chr1", "start": 1000, "end": 2000, "length": 50000 },
 *       "target": { "name": "chr5", "start": 3000, "end": 4000, "length": 60000 },
 *       "strand": "+",
 *       "numResidueMatches": 950,
 *       "alignmentBlockLength": 1000,
 *       "mappingQuality": 60
 *     }
 *   ]
 * }
 */
export default class DynamicSyntenyAdapter extends BaseFeatureDataAdapter {
  private cache: Map<string, CacheEntry> = new Map()
  private refreshTimer?: ReturnType<typeof setInterval>
  // Track in-flight requests to prevent duplicate concurrent fetches
  private inFlightRequests: Map<string, Promise<Feature[]>> = new Map()

  constructor(config: any, getSubAdapter?: any, pluginManager?: any) {
    super(config, getSubAdapter, pluginManager)

    const refreshInterval = readConfObject(config, 'refreshInterval') as number
    if (refreshInterval > 0) {
      this.setupAutoRefresh(refreshInterval)
    }
  }

  /**
   * Setup automatic cache refresh
   */
  private setupAutoRefresh(interval: number): void {
    this.refreshTimer = setInterval(() => {
      this.cache.clear()
    }, interval)
  }

  /**
   * Generate cache key including assembly name for synteny tracks
   * For client-side filtering, use a global key since we fetch the full dataset
   */
  private getCacheKey(region: Region): string {
    const clientSideFilter = readConfObject(this.config, 'clientSideFilter') as boolean
    const assemblyName = (region as any).assemblyName || 'default'

    if (clientSideFilter) {
      // Global cache key when filtering client-side (full dataset)
      return `global:${assemblyName}`
    }

    // Region-specific cache key for API-filtered data
    return `${assemblyName}:${region.refName}:${region.start}-${region.end}`
  }

  /**
   * Check if cached entry is still valid
   */
  private isCacheValid(entry: CacheEntry): boolean {
    const cacheTimeout = readConfObject(this.config, 'cacheTimeout') as number
    if (cacheTimeout === 0) return false

    return Date.now() - entry.timestamp < cacheTimeout
  }

  /**
   * Get reference sequence names
   * For dynamic synteny tracks, we typically don't know these in advance
   */
  async getRefNames(): Promise<string[]> {
    return []
  }

  /**
   * Check if a feature overlaps with the requested region
   */
  private featureOverlapsRegion(feature: Feature, region: Region): boolean {
    return (
      feature.get('refName') === region.refName &&
      feature.get('start') < region.end &&
      feature.get('end') > region.start
    )
  }

  /**
   * Get features for a genomic region
   * Main entry point called by JBrowse
   */
  getFeatures(region: Region, options: any = {}) {
    return ObservableCreate<Feature>(async (observer) => {
      try {
        const clientSideFilter = readConfObject(this.config, 'clientSideFilter') as boolean

        // Check cache first
        const cacheKey = this.getCacheKey(region)
        const cached = this.cache.get(cacheKey)

        if (cached && this.isCacheValid(cached)) {
          // Apply client-side filtering if enabled
          const features = clientSideFilter
            ? cached.features.filter((f) => this.featureOverlapsRegion(f, region))
            : cached.features

          features.forEach((f) => observer.next(f))
          observer.complete()
          return
        }

        // Check if request is already in-flight for this cache key
        let allFeatures: Feature[]
        const inFlight = this.inFlightRequests.get(cacheKey)

        if (inFlight) {
          // Wait for the existing request to complete instead of making a duplicate
          allFeatures = await inFlight
        } else {
          // Start new request and track it
          const fetchPromise = this.fetchFeatures(region, options)
          this.inFlightRequests.set(cacheKey, fetchPromise)

          try {
            allFeatures = await fetchPromise

            // Cache if enabled (cache full dataset for client-side filtering)
            const cacheTimeout = readConfObject(this.config, 'cacheTimeout') as number
            if (cacheTimeout > 0) {
              this.cache.set(cacheKey, {
                features: allFeatures,
                timestamp: Date.now(),
              })
            }
          } finally {
            // Always clean up in-flight tracking, even if request fails
            this.inFlightRequests.delete(cacheKey)
          }
        }

        // Apply client-side filtering if enabled
        const features = clientSideFilter
          ? allFeatures.filter((f) => this.featureOverlapsRegion(f, region))
          : allFeatures

        // Emit features
        features.forEach((feature) => observer.next(feature))
        observer.complete()
      } catch (error) {
        observer.error(error)
      }
    }, options.stopToken)
  }

  /**
   * Fetch features from REST API endpoint
   */
  private async fetchFeatures(region: Region, options: any): Promise<Feature[]> {
    const url = readConfObject(this.config, 'url') as string
    const method = readConfObject(this.config, 'method') as string
    const headers = readConfObject(this.config, 'requestHeaders') as Record<string, string>
    const appendRegionParams = readConfObject(this.config, 'appendRegionParams') as boolean

    if (!url) {
      throw new Error('DynamicSyntenyAdapter: url configuration is required')
    }

    // Build request URL with query parameters
    const requestUrl = new URL(url)

    // Only append region parameters if configured to do so
    if (appendRegionParams) {
      requestUrl.searchParams.append('refName', region.refName)
      requestUrl.searchParams.append('start', String(region.start))
      requestUrl.searchParams.append('end', String(region.end))

      // Add assemblyName for synteny tracks
      const assemblyName = (region as any).assemblyName
      if (assemblyName) {
        requestUrl.searchParams.append('assemblyName', assemblyName)
      }
    }

    // Make HTTP request
    const response = await fetch(requestUrl.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: options.stopToken?.abortSignal,
    })

    if (!response.ok) {
      throw new Error(
        `DynamicSyntenyAdapter: HTTP ${response.status}: ${response.statusText} - Failed to fetch from ${requestUrl}`
      )
    }

    // Parse JSON response
    const data: MacroSyntenyResponse = await response.json()

    return this.parseAlignments(data, region)
  }

  /**
   * Parse API response and convert to JBrowse features with mate relationships
   */
  private parseAlignments(data: any, region: Region): Feature[] {
    // Read configuration for field names
    const alignmentsField = readConfObject(this.config, 'alignmentsField') as string
    const queryNameField = readConfObject(this.config, 'queryNameField') as string
    const queryStartField = readConfObject(this.config, 'queryStartField') as string
    const queryEndField = readConfObject(this.config, 'queryEndField') as string
    const queryLengthField = readConfObject(this.config, 'queryLengthField') as string
    const targetNameField = readConfObject(this.config, 'targetNameField') as string
    const targetStartField = readConfObject(this.config, 'targetStartField') as string
    const targetEndField = readConfObject(this.config, 'targetEndField') as string
    const targetLengthField = readConfObject(this.config, 'targetLengthField') as string
    const strandField = readConfObject(this.config, 'strandField') as string
    const numResidueMatchesField = readConfObject(this.config, 'numResidueMatchesField') as string
    const alignmentBlockLengthField = readConfObject(this.config, 'alignmentBlockLengthField') as string
    const identityField = readConfObject(this.config, 'identityField') as string
    const mappingQualityField = readConfObject(this.config, 'mappingQualityField') as string

    // Extract alignments array from response
    const alignmentsArray: AlignmentData[] = getNestedValue(data, alignmentsField) || []

    if (!Array.isArray(alignmentsArray)) {
      console.warn(`DynamicSyntenyAdapter: "${alignmentsField}" is not an array in API response`)
      return []
    }

    return alignmentsArray
      .map((alignment: any, index: number) => {
        try {
          return this.parseAlignment(alignment, index, region, {
            queryNameField,
            queryStartField,
            queryEndField,
            queryLengthField,
            targetNameField,
            targetStartField,
            targetEndField,
            targetLengthField,
            strandField,
            numResidueMatchesField,
            alignmentBlockLengthField,
            identityField,
            mappingQualityField,
          })
        } catch (error) {
          console.warn(`DynamicSyntenyAdapter: Failed to parse alignment at index ${index}:`, error)
          return null
        }
      })
      .filter((f): f is Feature => f !== null)
  }

  /**
   * Get assembly names from adapter configuration
   */
  private getAssemblyNames(): string[] {
    return readConfObject(this.config, 'assemblyNames') as string[]
  }

  /**
   * Parse individual alignment into JBrowse feature with mate information
   */
  private parseAlignment(
    alignment: any,
    index: number,
    region: Region,
    fieldMappings: Record<string, string>
  ): Feature | null {
    const {
      queryNameField,
      queryStartField,
      queryEndField,
      queryLengthField,
      targetNameField,
      targetStartField,
      targetEndField,
      targetLengthField,
      strandField,
      numResidueMatchesField,
      alignmentBlockLengthField,
      identityField,
      mappingQualityField,
    } = fieldMappings

    // Extract query coordinates using nested field access
    const queryName = getNestedValue(alignment, queryNameField)
    const queryStart = parseInt(getNestedValue(alignment, queryStartField), 10)
    const queryEnd = parseInt(getNestedValue(alignment, queryEndField), 10)
    const queryLength = parseInt(getNestedValue(alignment, queryLengthField), 10)

    // Extract target coordinates using nested field access
    const targetName = getNestedValue(alignment, targetNameField)
    const targetStart = parseInt(getNestedValue(alignment, targetStartField), 10)
    const targetEnd = parseInt(getNestedValue(alignment, targetEndField), 10)
    const targetLength = parseInt(getNestedValue(alignment, targetLengthField), 10)

    // Validate query coordinates
    if (!queryName || isNaN(queryStart) || isNaN(queryEnd)) {
      console.warn('DynamicSyntenyAdapter: Invalid query coordinates in alignment:', alignment)
      return null
    }

    if (queryStart >= queryEnd) {
      console.warn('DynamicSyntenyAdapter: Invalid query coordinate range (start >= end):', alignment)
      return null
    }

    // Validate target coordinates
    if (!targetName || isNaN(targetStart) || isNaN(targetEnd)) {
      console.warn('DynamicSyntenyAdapter: Invalid target coordinates in alignment:', alignment)
      return null
    }

    if (targetStart >= targetEnd) {
      console.warn('DynamicSyntenyAdapter: Invalid target coordinate range (start >= end):', alignment)
      return null
    }

    // Extract strand
    const strandValue = getNestedValue(alignment, strandField) || '+'
    const strand = strandValue === '-' || strandValue === -1 || strandValue === '-1' ? -1 : 1

    // Extract alignment metadata
    const numResidueMatches = getNestedValue(alignment, numResidueMatchesField)
    const alignmentBlockLength = getNestedValue(alignment, alignmentBlockLengthField)
    const identity = Number(getNestedValue(alignment, identityField)) || 0
    const mappingQuality = getNestedValue(alignment, mappingQualityField)

    // Generate unique ID
    const uniqueId = `${queryName}:${queryStart}-${queryEnd}_${targetName}:${targetStart}-${targetEnd}`

    // Implement PAFAdapter's flip logic
    const assemblyNames = this.getAssemblyNames()
    const queryAssemblyName = (region as any).assemblyName
    const assemblyIndex = assemblyNames.indexOf(queryAssemblyName)
    const flip = assemblyIndex === 0

    // Determine which sequence is the primary feature and which is the mate
    let featureRefName: string
    let featureStart: number
    let featureEnd: number
    let mateRefName: string
    let mateStart: number
    let mateEnd: number

    if (flip) {
      // Query assembly - use query as primary, target as mate
      featureRefName = queryName
      featureStart = queryStart
      featureEnd = queryEnd
      mateRefName = targetName
      mateStart = targetStart
      mateEnd = targetEnd
    } else {
      // Target assembly - use target as primary, query as mate
      featureRefName = targetName
      featureStart = targetStart
      featureEnd = targetEnd
      mateRefName = queryName
      mateStart = queryStart
      mateEnd = queryEnd
    }

    // Create synteny feature with mate property (matching PAFAdapter structure)
    return new SimpleFeature({
      uniqueId,
      refName: featureRefName,
      start: featureStart,
      end: featureEnd,
      assemblyName: queryAssemblyName,
      strand,
      mate: {
        refName: mateRefName,
        start: mateStart,
        end: mateEnd,
        assemblyName: assemblyNames[flip ? 1 : 0], // The OTHER assembly
      },
      type: 'match',
      syntenyId: index,
      name: uniqueId,
      queryLength,
      targetLength,
      numMatches: numResidueMatches,
      blockLen: alignmentBlockLength,
      mappingQuality,
      identity,
    })
  }

  /**
   * Check if adapter has data for a given reference name
   */
  async hasDataForRefName(refName: string): Promise<boolean> {
    // For dynamic adapters, we don't know in advance - return true to allow queries
    return true
  }

  /**
   * Free resources and clean up
   */
  freeResources(region?: Region): void {
    if (region) {
      this.cache.delete(this.getCacheKey(region))
    } else {
      this.cache.clear()
    }

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = undefined
    }
  }
}
