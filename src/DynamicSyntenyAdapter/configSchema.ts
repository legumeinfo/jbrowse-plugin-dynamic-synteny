import { ConfigurationSchema } from '@jbrowse/core/configuration'

export const configSchema = ConfigurationSchema(
  'DynamicSyntenyAdapter',
  {
    url: {
      type: 'string',
      description:
        'Base URL for fetching features. Query parameters (refName, start, end) will be appended automatically.',
      defaultValue: 'https://api.example.com/features',
    },
    method: {
      type: 'string',
      description: 'HTTP method to use (GET or POST)',
      defaultValue: 'GET',
    },
    requestHeaders: {
      type: 'frozen',
      description:
        'Additional HTTP headers to include in requests (e.g., Authorization)',
      defaultValue: {},
    },
    responseType: {
      type: 'string',
      description: 'Expected response format (json, bed, or gff3)',
      defaultValue: 'json',
    },
    // Root array field name
    alignmentsField: {
      type: 'string',
      description: 'JSON field containing alignments array',
      defaultValue: 'alignments',
    },

    // Query sequence fields (nested under query object)
    queryNameField: {
      type: 'string',
      description: 'JSON field containing query sequence name (e.g., "query.name")',
      defaultValue: 'query.name',
    },
    queryStartField: {
      type: 'string',
      description: 'JSON field containing query start position (e.g., "query.start")',
      defaultValue: 'query.start',
    },
    queryEndField: {
      type: 'string',
      description: 'JSON field containing query end position (e.g., "query.end")',
      defaultValue: 'query.end',
    },
    queryLengthField: {
      type: 'string',
      description: 'JSON field containing query sequence length (e.g., "query.length")',
      defaultValue: 'query.length',
    },

    // Target sequence fields (nested under target object)
    targetNameField: {
      type: 'string',
      description: 'JSON field containing target sequence name (e.g., "target.name")',
      defaultValue: 'target.name',
    },
    targetStartField: {
      type: 'string',
      description: 'JSON field containing target start position (e.g., "target.start")',
      defaultValue: 'target.start',
    },
    targetEndField: {
      type: 'string',
      description: 'JSON field containing target end position (e.g., "target.end")',
      defaultValue: 'target.end',
    },
    targetLengthField: {
      type: 'string',
      description: 'JSON field containing target sequence length (e.g., "target.length")',
      defaultValue: 'target.length',
    },

    // Alignment metadata fields
    strandField: {
      type: 'string',
      description: 'JSON field containing strand information (+/- or 1/-1)',
      defaultValue: 'strand',
    },
    numResidueMatchesField: {
      type: 'string',
      description: 'JSON field containing number of matching residues',
      defaultValue: 'numResidueMatches',
    },
    alignmentBlockLengthField: {
      type: 'string',
      description: 'JSON field containing alignment block length',
      defaultValue: 'alignmentBlockLength',
    },
    mappingQualityField: {
      type: 'string',
      description: 'JSON field containing mapping quality score',
      defaultValue: 'mappingQuality',
    },

    // Assembly names
    assemblyNames: {
      type: 'stringArray',
      description: 'Assembly names for synteny tracks (e.g., ["assembly1", "assembly2"])',
      defaultValue: [],
    },

    refreshInterval: {
      type: 'number',
      description: 'Auto-refresh interval in milliseconds (0 = disabled)',
      defaultValue: 0,
    },
    cacheTimeout: {
      type: 'number',
      description: 'Cache timeout in milliseconds (0 = no cache)',
      defaultValue: 60000, // 1 minute
    },
    appendRegionParams: {
      type: 'boolean',
      description: 'Append region query parameters (refName, start, end) to API requests',
      defaultValue: true,
    },
    clientSideFilter: {
      type: 'boolean',
      description: 'Filter results client-side by region (useful when API returns full dataset)',
      defaultValue: false,
    },
  },
  { explicitlyTyped: true },
)
