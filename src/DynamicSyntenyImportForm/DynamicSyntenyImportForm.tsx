import React, { useState } from 'react'
import { observer } from 'mobx-react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material'

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
    const [genome1, setGenome1] = useState('')
    const [genome2, setGenome2] = useState('')
    const [matched, setMatched] = useState(10)
    const [intermediate, setIntermediate] = useState(5)
    const [mask, setMask] = useState(20)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLoad = () => {
      try {
        // Validate inputs
        if (!genome1 || !genome2) {
          setError('Please enter both genome identifiers')
          return
        }

        if (!endpoint) {
          setError('Please enter an API endpoint')
          return
        }

        // Build the dynamic synteny track URL
        const url = `${endpoint}?genome1=${genome1}&genome2=${genome2}&matched=${matched}&intermediate=${intermediate}&mask=${mask}&format=json`

        // Create the track configuration
        const trackConfig = {
          type: 'SyntenyTrack',
          trackId: `dynamic-synteny-${Date.now()}`,
          name: `Dynamic Synteny: ${genome1} vs ${genome2}`,
          assemblyNames: [assembly1, assembly2],
          adapter: {
            type: 'DynamicSyntenyAdapter',
            url,
            appendRegionParams: false,
            assemblyNames: [assembly1, assembly2],
            clientSideFilter: true,
            cacheTimeout: 300000,
          },
        }

        // Set the track on the model
        model.setImportFormSyntenyTrack(0, trackConfig)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load track')
      }
    }

    return (
      <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Load Dynamic Synteny Track
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Fetch synteny data from a REST API endpoint
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

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <TextField
            label="Genome 1"
            value={genome1}
            onChange={(e) => setGenome1(e.target.value)}
            placeholder="e.g., glyma.Wm82.gnm4"
            size="small"
            fullWidth
            required
          />
          <TextField
            label="Genome 2"
            value={genome2}
            onChange={(e) => setGenome2(e.target.value)}
            placeholder="e.g., glyma.Wm82.gnm4"
            size="small"
            fullWidth
            required
          />
        </Box>

        {/* Advanced Options */}
        <Box sx={{ mt: 2 }}>
          <Button
            size="small"
            onClick={() => setShowAdvanced(!showAdvanced)}
            endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            Advanced Options
          </Button>
          <Collapse in={showAdvanced}>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                label="Matched"
                type="number"
                value={matched}
                onChange={(e) => setMatched(Number(e.target.value))}
                size="small"
                fullWidth
                helperText="Min matched genes"
              />
              <TextField
                label="Intermediate"
                type="number"
                value={intermediate}
                onChange={(e) => setIntermediate(Number(e.target.value))}
                size="small"
                fullWidth
                helperText="Max intermediate genes"
              />
              <TextField
                label="Mask"
                type="number"
                value={mask}
                onChange={(e) => setMask(Number(e.target.value))}
                size="small"
                fullWidth
                helperText="Mask threshold"
              />
            </Box>
          </Collapse>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleLoad}
          sx={{ mt: 2 }}
          disabled={!genome1 || !genome2 || !endpoint}
          fullWidth
        >
          Load Track
        </Button>
      </Box>
    )
  }
)

// Component for LinearSyntenyView
export const LinearSyntenyDynamicSyntenyImportForm: React.FC<LinearSyntenyProps> = observer(
  ({ model, assembly1, assembly2, selectedRow }) => {
    const [endpoint, setEndpoint] = useState('http://localhost/gcv/microservices/macro-synteny-paf')
    const [genome1, setGenome1] = useState('')
    const [genome2, setGenome2] = useState('')
    const [matched, setMatched] = useState(10)
    const [intermediate, setIntermediate] = useState(5)
    const [mask, setMask] = useState(20)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLoad = () => {
      try {
        // Validate inputs
        if (!genome1 || !genome2) {
          setError('Please enter both genome identifiers')
          return
        }

        if (!endpoint) {
          setError('Please enter an API endpoint')
          return
        }

        // Build the dynamic synteny track URL
        const url = `${endpoint}?genome1=${genome1}&genome2=${genome2}&matched=${matched}&intermediate=${intermediate}&mask=${mask}&format=json`

        // Create the track configuration
        const trackConfig = {
          type: 'SyntenyTrack',
          trackId: `dynamic-synteny-${Date.now()}`,
          name: `Dynamic Synteny: ${genome1} vs ${genome2}`,
          assemblyNames: [assembly1, assembly2],
          adapter: {
            type: 'DynamicSyntenyAdapter',
            url,
            appendRegionParams: false,
            assemblyNames: [assembly1, assembly2],
            clientSideFilter: true,
            cacheTimeout: 300000,
          },
        }

        // Use selectedRow for LinearSyntenyView
        model.setImportFormSyntenyTrack(selectedRow, trackConfig)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load track')
      }
    }

    return (
      <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Load Dynamic Synteny Track (Row {selectedRow + 1})
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Fetch synteny data from a REST API endpoint
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

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <TextField
            label="Genome 1"
            value={genome1}
            onChange={(e) => setGenome1(e.target.value)}
            placeholder="e.g., glyma.Wm82.gnm4"
            size="small"
            fullWidth
            required
          />
          <TextField
            label="Genome 2"
            value={genome2}
            onChange={(e) => setGenome2(e.target.value)}
            placeholder="e.g., glyma.Wm82.gnm4"
            size="small"
            fullWidth
            required
          />
        </Box>

        {/* Advanced Options */}
        <Box sx={{ mt: 2 }}>
          <Button
            size="small"
            onClick={() => setShowAdvanced(!showAdvanced)}
            endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            Advanced Options
          </Button>
          <Collapse in={showAdvanced}>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                label="Matched"
                type="number"
                value={matched}
                onChange={(e) => setMatched(Number(e.target.value))}
                size="small"
                fullWidth
                helperText="Min matched genes"
              />
              <TextField
                label="Intermediate"
                type="number"
                value={intermediate}
                onChange={(e) => setIntermediate(Number(e.target.value))}
                size="small"
                fullWidth
                helperText="Max intermediate genes"
              />
              <TextField
                label="Mask"
                type="number"
                value={mask}
                onChange={(e) => setMask(Number(e.target.value))}
                size="small"
                fullWidth
                helperText="Mask threshold"
              />
            </Box>
          </Collapse>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleLoad}
          sx={{ mt: 2 }}
          disabled={!genome1 || !genome2 || !endpoint}
          fullWidth
        >
          Load Track
        </Button>
      </Box>
    )
  }
)
