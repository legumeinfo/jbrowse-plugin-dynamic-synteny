import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'
import { version } from '../package.json'
import { DynamicSyntenyAdapter, configSchema as adapterConfigSchema } from './DynamicSyntenyAdapter'
import {
  DotplotDynamicSyntenyImportForm,
  LinearSyntenyDynamicSyntenyImportForm,
} from './DynamicSyntenyImportForm'
import { configSchema } from './config/configSchema'

// Type definitions for extension point options
interface DotplotImportFormSyntenyOption {
  value: string
  label: string
  ReactComponent: React.FC<any>
}

interface LinearSyntenyImportFormSyntenyOption {
  value: string
  label: string
  ReactComponent: React.FC<any>
}

export default class DynamicSyntenyPlugin extends Plugin {
  name = 'DynamicSynteny'
  version = version
  configurationSchema = configSchema

  install(pluginManager: PluginManager) {
    // Register adapter
    pluginManager.addAdapterType(() => {
      return new AdapterType({
        name: 'DynamicSyntenyAdapter',
        displayName: 'Dynamic Synteny Adapter',
        configSchema: adapterConfigSchema,
        AdapterClass: DynamicSyntenyAdapter,
        adapterMetadata: {
          category: 'Synteny/Alignment Adapters',
          hiddenFromGUI: false,
          description:
            'Fetches synteny and alignment data from REST API endpoints for comparative genomics visualization',
        },
      })
    })

    // Add DotplotView custom radio option
    pluginManager.addToExtensionPoint(
      'DotplotView-ImportFormSyntenyOptions',
      (
        options: DotplotImportFormSyntenyOption[],
        { model, assembly1, assembly2 },
      ) => {
        return [
          ...options,
          {
            value: 'dynamic-synteny',
            label: 'Load from Dynamic Synteny API',
            ReactComponent: DotplotDynamicSyntenyImportForm,
          },
        ]
      },
    )

    // Add LinearSyntenyView custom radio option
    pluginManager.addToExtensionPoint(
      'LinearSyntenyView-ImportFormSyntenyOptions',
      (
        options: LinearSyntenyImportFormSyntenyOption[],
        { model, assembly1, assembly2, selectedRow },
      ) => {
        return [
          ...options,
          {
            value: 'dynamic-synteny',
            label: 'Load from Dynamic Synteny API',
            ReactComponent: LinearSyntenyDynamicSyntenyImportForm,
          },
        ]
      },
    )
  }
}
