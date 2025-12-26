import { types, onSnapshot } from 'mobx-state-tree'
import PluginManager from '@jbrowse/core/PluginManager'
import { ElementId } from '@jbrowse/core/util/types/mst'

// Define your configuration options interface
interface PluginConfig {
  syntenyEndpoint: string
  maxResults: number
  enableAutoRefresh: boolean
  refreshInterval: number
  colorScheme: string
  minScore: number
  assemblyNames: string[]
}

// Default configuration
const DEFAULT_CONFIG: PluginConfig = {
  syntenyEndpoint: 'https://api.example.com/synteny',
  maxResults: 100,
  enableAutoRefresh: false,
  refreshInterval: 30,
  colorScheme: 'default',
  minScore: 0,
  assemblyNames: [],
}

// Storage key
const STORAGE_KEY = 'dynamicSyntenyConfig'

// Helper to load config from localStorage
function loadConfig(): PluginConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Failed to load plugin config:', e)
  }
  return DEFAULT_CONFIG
}

// Helper to save config to localStorage
function saveConfig(config: PluginConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (e) {
    console.error('Failed to save plugin config:', e)
  }
}

// Export for use in other parts of the plugin
export function getPluginConfig(): PluginConfig {
  return loadConfig()
}

export default function stateModelFactory(_pluginManager: PluginManager) {
  return types
    .model('DynamicSyntenyWidget', {
      id: ElementId,
      type: types.literal('DynamicSyntenyWidget'),

      // Configuration fields with defaults
      syntenyEndpoint: types.optional(types.string, DEFAULT_CONFIG.syntenyEndpoint),
      maxResults: types.optional(types.number, DEFAULT_CONFIG.maxResults),
      enableAutoRefresh: types.optional(types.boolean, DEFAULT_CONFIG.enableAutoRefresh),
      refreshInterval: types.optional(types.number, DEFAULT_CONFIG.refreshInterval),
      colorScheme: types.optional(types.string, DEFAULT_CONFIG.colorScheme),
      minScore: types.optional(types.number, DEFAULT_CONFIG.minScore),
      assemblyNames: types.optional(types.array(types.string), []),
    })
    .volatile(() => ({
      isLoading: false,
      error: null as string | null,
      isSaved: false,
    }))
    .actions((self) => ({
      // Load settings from localStorage on init
      afterCreate() {
        const config = loadConfig()
        self.syntenyEndpoint = config.syntenyEndpoint
        self.maxResults = config.maxResults
        self.enableAutoRefresh = config.enableAutoRefresh
        self.refreshInterval = config.refreshInterval
        self.colorScheme = config.colorScheme
        self.minScore = config.minScore
        self.assemblyNames.replace(config.assemblyNames)

        // Auto-save on any change
        onSnapshot(self, (snapshot) => {
          saveConfig({
            syntenyEndpoint: snapshot.syntenyEndpoint,
            maxResults: snapshot.maxResults,
            enableAutoRefresh: snapshot.enableAutoRefresh,
            refreshInterval: snapshot.refreshInterval,
            colorScheme: snapshot.colorScheme,
            minScore: snapshot.minScore,
            assemblyNames: [...snapshot.assemblyNames],
          })
        })
      },

      setSyntenyEndpoint(value: string) {
        self.syntenyEndpoint = value
      },

      setMaxResults(value: number) {
        self.maxResults = value
      },

      setEnableAutoRefresh(value: boolean) {
        self.enableAutoRefresh = value
      },

      setRefreshInterval(value: number) {
        self.refreshInterval = value
      },

      setColorScheme(value: string) {
        self.colorScheme = value
      },

      setMinScore(value: number) {
        self.minScore = value
      },

      addAssemblyName(name: string) {
        if (name && !self.assemblyNames.includes(name)) {
          self.assemblyNames.push(name)
        }
      },

      removeAssemblyName(index: number) {
        self.assemblyNames.splice(index, 1)
      },

      resetToDefaults() {
        self.syntenyEndpoint = DEFAULT_CONFIG.syntenyEndpoint
        self.maxResults = DEFAULT_CONFIG.maxResults
        self.enableAutoRefresh = DEFAULT_CONFIG.enableAutoRefresh
        self.refreshInterval = DEFAULT_CONFIG.refreshInterval
        self.colorScheme = DEFAULT_CONFIG.colorScheme
        self.minScore = DEFAULT_CONFIG.minScore
        self.assemblyNames.replace(DEFAULT_CONFIG.assemblyNames)
      },

      setError(error: string | null) {
        self.error = error
      },

      setLoading(loading: boolean) {
        self.isLoading = loading
      },

      setIsSaved(saved: boolean) {
        self.isSaved = saved
      },
    }))
    .views((self) => ({
      // Computed values you can use elsewhere in your plugin
      get configSummary() {
        return {
          syntenyEndpoint: self.syntenyEndpoint,
          maxResults: self.maxResults,
          enableAutoRefresh: self.enableAutoRefresh,
          refreshInterval: self.refreshInterval,
          colorScheme: self.colorScheme,
          minScore: self.minScore,
          assemblyNames: [...self.assemblyNames],
        }
      },

      get isValidEndpoint() {
        try {
          new URL(self.syntenyEndpoint)
          return true
        } catch {
          return false
        }
      },
    }))
}
