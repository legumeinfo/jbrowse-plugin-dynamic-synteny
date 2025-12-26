import PluginManager from '@jbrowse/core/PluginManager'
import { WidgetType } from '@jbrowse/core/pluggableElementTypes'
import { configSchema } from './configSchema'
import stateModelFactory from './model'
import ReactComponent from './DynamicSyntenyWidget'

export default function DynamicSyntenyWidgetF(pluginManager: PluginManager) {
  pluginManager.addWidgetType(() => {
    return new WidgetType({
      name: 'DynamicSyntenyWidget',
      heading: 'Dynamic Synteny Settings',
      configSchema,
      stateModel: stateModelFactory(pluginManager),
      ReactComponent,
    })
  })
}
