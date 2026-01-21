import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  FormControl,
  FormLabel,
} from '@mui/material'
import { ErrorMessage } from '@jbrowse/core/ui'
import { getEnv } from '@jbrowse/core/util'
import { readConfObject } from '@jbrowse/core/configuration'

interface DotplotProps {
  model: any // DotplotViewModel
  assembly1: string
  assembly2: string
}

interface LinearSyntenyProps {
  model: any // LinearSyntenyViewModel
  assembly1: string
  assembly2: string
  selectedRow: number
}

// Component for DotplotView
export const DotplotDynamicSyntenyImportForm: React.FC<DotplotProps> = observer(
  ({ model, assembly1, assembly2 }) => {
    // Access plugin configuration from rootModel.jbrowse.configuration
    let configuredEndpoint = ''
    try {
      const { pluginManager } = getEnv(model)
      const rootModel = (pluginManager as any)?.rootModel
      const jbrowseConfig = rootModel?.jbrowse?.configuration
      const pluginConfig = jbrowseConfig?.DynamicSynteny
      if (pluginConfig) {
        configuredEndpoint = readConfObject(pluginConfig, 'endpoint')
      }
    } catch (e) {
      // Fall back to empty string
    }

    const [endpoint, setEndpoint] = useState(configuredEndpoint)
    const [matched, setMatched] = useState(10)
    const [intermediate, setIntermediate] = useState(5)
    const [mask, setMask] = useState(20)
    const [identity, setIdentity] = useState<'levenshtein' | 'jaccard'>('levenshtein')
    const [anchors, setAnchors] = useState<'simple' | 'regular'>('simple')
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      try {
        // Only set track if we have required inputs
        if (endpoint && assembly1 && assembly2) {
          // Build the dynamic synteny track URL using assembly names
          const url = `${endpoint}?genome1=${assembly1}&genome2=${assembly2}&matched=${matched}&intermediate=${intermediate}&mask=${mask}&identity=${identity}&anchors=${anchors}&format=json`

          // Create the track configuration
          const trackId = `dynamic-synteny-${Date.now()}-sessionTrack`
          const trackName = `Dynamic Synteny: ${assembly1} vs ${assembly2}`

          // Set the track on the model with proper structure
          model.setImportFormSyntenyTrack(0, {
            type: 'userOpened',
            value: {
              trackId,
              name: trackName,
              assemblyNames: [assembly1, assembly2],
              type: 'SyntenyTrack',
              adapter: {
                type: 'DynamicSyntenyAdapter',
                url,
                appendRegionParams: false,
                assemblyNames: [assembly1, assembly2],
                clientSideFilter: true,
                cacheTimeout: 300000,
              },
            },
          })
          setError(null)
        }
      } catch (e) {
        console.error(e)
        setError(e instanceof Error ? e.message : 'Failed to load track')
      }
    }, [model, assembly1, assembly2, endpoint, matched, intermediate, mask, identity, anchors])

    return (
      <Paper style={{ padding: 12 }}>
        {error ? <ErrorMessage error={error} /> : null}
        <Typography>
          Configure dynamic synteny track for {assembly1} and {assembly2}. The
          track will be shown when you hit "Launch".
        </Typography>

        <TextField
          fullWidth
          label="API Endpoint"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          margin="normal"
          size="small"
        />

        {/* Advanced Options */}
        <Box style={{ marginTop: 12 }}>
          <Button
            size="small"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>
          <Collapse in={showAdvanced}>
            <Box style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <TextField
                label="Matched"
                type="number"
                value={matched}
                onChange={(e) => setMatched(Number(e.target.value))}
                size="small"
                style={{ flex: 1 }}
                helperText="Min matched genes"
              />
              <TextField
                label="Intermediate"
                type="number"
                value={intermediate}
                onChange={(e) => setIntermediate(Number(e.target.value))}
                size="small"
                style={{ flex: 1 }}
                helperText="Max intermediate genes"
              />
              <TextField
                label="Mask"
                type="number"
                value={mask}
                onChange={(e) => setMask(Number(e.target.value))}
                size="small"
                style={{ flex: 1 }}
                helperText="Mask threshold"
              />
            </Box>
            <Box style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Tooltip
                title="Levenshtein distance measures the edit distance, the minimum number of operations to transform one sequence to another. Jaccard similarity on the other hand measures set overlap irrespective of order."
                arrow
                placement="top"
              >
                <FormControl>
                  <FormLabel style={{ fontSize: '0.75rem', marginBottom: 4 }}>
                    Identity Metric
                  </FormLabel>
                  <ToggleButtonGroup
                    value={identity}
                    exclusive
                    onChange={(_, newValue) => {
                      if (newValue !== null) {
                        setIdentity(newValue)
                      }
                    }}
                    size="small"
                  >
                    <ToggleButton value="levenshtein">Levenshtein</ToggleButton>
                    <ToggleButton value="jaccard">Jaccard</ToggleButton>
                  </ToggleButtonGroup>
                </FormControl>
              </Tooltip>
              <Tooltip
                title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                arrow
                placement="top"
              >
                <FormControl>
                  <FormLabel style={{ fontSize: '0.75rem', marginBottom: 4 }}>
                    Anchors
                  </FormLabel>
                  <ToggleButtonGroup
                    value={anchors}
                    exclusive
                    onChange={(_, newValue) => {
                      if (newValue !== null) {
                        setAnchors(newValue)
                      }
                    }}
                    size="small"
                  >
                    <ToggleButton value="simple">Simple</ToggleButton>
                    <ToggleButton value="regular">Regular</ToggleButton>
                  </ToggleButtonGroup>
                </FormControl>
              </Tooltip>
            </Box>
          </Collapse>
        </Box>
      </Paper>
    )
  }
)

// Component for LinearSyntenyView
export const LinearSyntenyDynamicSyntenyImportForm: React.FC<LinearSyntenyProps> = observer(
  ({ model, assembly1, assembly2, selectedRow }) => {
    // Access plugin configuration from rootModel.jbrowse.configuration
    let configuredEndpoint = ''
    try {
      const { pluginManager } = getEnv(model)
      const rootModel = (pluginManager as any)?.rootModel
      const jbrowseConfig = rootModel?.jbrowse?.configuration
      const pluginConfig = jbrowseConfig?.DynamicSynteny
      if (pluginConfig) {
        configuredEndpoint = readConfObject(pluginConfig, 'endpoint')
      }
    } catch (e) {
      // Fall back to empty string
    }

    const [endpoint, setEndpoint] = useState(configuredEndpoint)
    const [matched, setMatched] = useState(10)
    const [intermediate, setIntermediate] = useState(5)
    const [mask, setMask] = useState(20)
    const [identity, setIdentity] = useState<'levenshtein' | 'jaccard'>('levenshtein')
    const [anchors, setAnchors] = useState<'simple' | 'regular'>('simple')
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      try {
        // Only set track if we have required inputs
        if (endpoint && assembly1 && assembly2) {
          // Build the dynamic synteny track URL using assembly names
          const url = `${endpoint}?genome1=${assembly1}&genome2=${assembly2}&matched=${matched}&intermediate=${intermediate}&mask=${mask}&identity=${identity}&anchors=${anchors}&format=json`

          // Create the track configuration
          const trackId = `dynamic-synteny-${Date.now()}-sessionTrack`
          const trackName = `Dynamic Synteny: ${assembly1} vs ${assembly2}`

          // Set the track on the model with proper structure (use selectedRow for LinearSyntenyView)
          model.setImportFormSyntenyTrack(selectedRow, {
            type: 'userOpened',
            value: {
              trackId,
              name: trackName,
              assemblyNames: [assembly1, assembly2],
              type: 'SyntenyTrack',
              adapter: {
                type: 'DynamicSyntenyAdapter',
                url,
                appendRegionParams: false,
                assemblyNames: [assembly1, assembly2],
                clientSideFilter: true,
                cacheTimeout: 300000,
              },
            },
          })
          setError(null)
        }
      } catch (e) {
        console.error(e)
        setError(e instanceof Error ? e.message : 'Failed to load track')
      }
    }, [model, assembly1, assembly2, selectedRow, endpoint, matched, intermediate, mask, identity, anchors])

    return (
      <Paper style={{ padding: 12 }}>
        {error ? <ErrorMessage error={error} /> : null}
        <Typography>
          Configure dynamic synteny track for {assembly1} and {assembly2}. The
          track will be shown when you hit "Launch".
        </Typography>

        <TextField
          fullWidth
          label="API Endpoint"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          margin="normal"
          size="small"
        />

        {/* Advanced Options */}
        <Box style={{ marginTop: 12 }}>
          <Button
            size="small"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>
          <Collapse in={showAdvanced}>
            <Box style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <TextField
                label="Matched"
                type="number"
                value={matched}
                onChange={(e) => setMatched(Number(e.target.value))}
                size="small"
                style={{ flex: 1 }}
                helperText="Min matched genes"
              />
              <TextField
                label="Intermediate"
                type="number"
                value={intermediate}
                onChange={(e) => setIntermediate(Number(e.target.value))}
                size="small"
                style={{ flex: 1 }}
                helperText="Max intermediate genes"
              />
              <TextField
                label="Mask"
                type="number"
                value={mask}
                onChange={(e) => setMask(Number(e.target.value))}
                size="small"
                style={{ flex: 1 }}
                helperText="Mask threshold"
              />
            </Box>
            <Box style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Tooltip
                title="Levenshtein distance measures the edit distance, the minimum number of operations to transform one sequence to another. Jaccard similarity on the other hand measures set overlap irrespective of order."
                arrow
                placement="top"
              >
                <FormControl>
                  <FormLabel style={{ fontSize: '0.75rem', marginBottom: 4 }}>
                    Identity Metric
                  </FormLabel>
                  <ToggleButtonGroup
                    value={identity}
                    exclusive
                    onChange={(_, newValue) => {
                      if (newValue !== null) {
                        setIdentity(newValue)
                      }
                    }}
                    size="small"
                  >
                    <ToggleButton value="levenshtein">Levenshtein</ToggleButton>
                    <ToggleButton value="jaccard">Jaccard</ToggleButton>
                  </ToggleButtonGroup>
                </FormControl>
              </Tooltip>
              <Tooltip
                title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                arrow
                placement="top"
              >
                <FormControl>
                  <FormLabel style={{ fontSize: '0.75rem', marginBottom: 4 }}>
                    Anchors
                  </FormLabel>
                  <ToggleButtonGroup
                    value={anchors}
                    exclusive
                    onChange={(_, newValue) => {
                      if (newValue !== null) {
                        setAnchors(newValue)
                      }
                    }}
                    size="small"
                  >
                    <ToggleButton value="simple">Simple</ToggleButton>
                    <ToggleButton value="regular">Regular</ToggleButton>
                  </ToggleButtonGroup>
                </FormControl>
              </Tooltip>
            </Box>
          </Collapse>
        </Box>
      </Paper>
    )
  }
)
