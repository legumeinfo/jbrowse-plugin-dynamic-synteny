import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'
import { version } from '../package.json'
import { DynamicSyntenyAdapter, configSchema as adapterConfigSchema } from './DynamicSyntenyAdapter'
import {
  DotplotDynamicSyntenyImportForm,
  LinearSyntenyDynamicSyntenyImportForm,
} from './DynamicSyntenyImportForm'

import type { DotplotImportFormSyntenyOption } from '@jbrowse/plugin-dotplot-view'
import type { LinearSyntenyImportFormSyntenyOption } from '@jbrowse/plugin-linear-comparative-view'

export default class DynamicSyntenyPlugin extends Plugin {
  name = 'DynamicSyntenyPlugin'
  version = version

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
