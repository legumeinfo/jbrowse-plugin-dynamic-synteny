import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Collapse,
} from '@mui/material'
import { ErrorMessage } from '@jbrowse/core/ui'

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
    const [endpoint, setEndpoint] = useState('http://localhost/gcv/microservices/macro-synteny-paf')
    const [matched, setMatched] = useState(10)
    const [intermediate, setIntermediate] = useState(5)
    const [mask, setMask] = useState(20)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      try {
        // Only set track if we have required inputs
        if (endpoint && assembly1 && assembly2) {
          // Build the dynamic synteny track URL using assembly names
          const url = `${endpoint}?genome1=${assembly1}&genome2=${assembly2}&matched=${matched}&intermediate=${intermediate}&mask=${mask}&format=json`

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
    }, [model, assembly1, assembly2, endpoint, matched, intermediate, mask])

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
          helperText="Base URL for the macro-synteny API"
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
          </Collapse>
        </Box>
      </Paper>
    )
  }
)

// Component for LinearSyntenyView
export const LinearSyntenyDynamicSyntenyImportForm: React.FC<LinearSyntenyProps> = observer(
  ({ model, assembly1, assembly2, selectedRow }) => {
    const [endpoint, setEndpoint] = useState('http://localhost/gcv/microservices/macro-synteny-paf')
    const [matched, setMatched] = useState(10)
    const [intermediate, setIntermediate] = useState(5)
    const [mask, setMask] = useState(20)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      try {
        // Only set track if we have required inputs
        if (endpoint && assembly1 && assembly2) {
          // Build the dynamic synteny track URL using assembly names
          const url = `${endpoint}?genome1=${assembly1}&genome2=${assembly2}&matched=${matched}&intermediate=${intermediate}&mask=${mask}&format=json`

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
    }, [model, assembly1, assembly2, selectedRow, endpoint, matched, intermediate, mask])

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
          helperText="Base URL for the macro-synteny API"
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
          </Collapse>
        </Box>
      </Paper>
    )
  }
)
