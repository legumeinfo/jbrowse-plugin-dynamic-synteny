import { ConfigurationSchema } from '@jbrowse/core/configuration'

export const configSchema = ConfigurationSchema(
  'DynamicSyntenyPlugin',
  {
    endpoint: {
      type: 'string',
      defaultValue: '',
      description: 'API endpoint URL for dynamic synteny queries',
    },
  },
)
