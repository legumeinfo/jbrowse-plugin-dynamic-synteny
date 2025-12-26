import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'
import { isAbstractMenuManager } from '@jbrowse/core/util'
import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'
import { version } from '../package.json'
//import { WidgetType } from '@jbrowse/core/pluggableElementTypes'
import { DynamicSyntenyAdapter, configSchema as adapterConfigSchema } from './DynamicSyntenyAdapter'
import DynamicSyntenyWidgetF from './DynamicSyntenyWidget'

export default class DynamicSyntenyPlugin extends Plugin {
  name = 'DynamicSyntenyPlugin'
  version = version

  install(pluginManager: PluginManager) {
    DynamicSyntenyWidgetF(pluginManager)

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
  }

  configure(pluginManager: PluginManager) {
    if (isAbstractMenuManager(pluginManager.rootModel)) {
      // Create a top-level menu for your plugin
      pluginManager.rootModel.appendToMenu('NCGR', {
        label: 'Dynamic Synteny',
        onClick: (session: any) => {
          // Check if widget already exists
          const existingWidget = session.widgets.get('DynamicSyntenyWidget')
          if (existingWidget) {
            session.showWidget(existingWidget)
          } else {
            const widget = session.addWidget(
              'DynamicSyntenyWidget',
              'DynamicSyntenyWidget',
              { id: 'DynamicSyntenyWidget' },
            )
            session.showWidget(widget)
          }
        },
      })

      // Add more menu items with submenus
      pluginManager.rootModel.appendToMenu('NCGR', {
        label: 'Data Management',
        subMenu: [
          {
            label: 'Reset to Defaults',
            onClick: (session: any) => {
              localStorage.removeItem('myPluginConfig')
              session.notify('Settings reset to defaults', 'success')
            },
          },
          {
            label: 'Export Settings',
            onClick: (session: any) => {
              const config = localStorage.getItem('myPluginConfig')
              if (config) {
                navigator.clipboard.writeText(config)
                session.notify('Settings copied to clipboard', 'success')
              }
            },
          },
        ],
      })
    }
  }
}
