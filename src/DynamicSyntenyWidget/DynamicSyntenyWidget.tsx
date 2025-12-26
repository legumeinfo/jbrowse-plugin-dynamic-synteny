import React, { useState } from 'react'
import { observer } from 'mobx-react'
import {
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Divider,
  Chip,
  IconButton,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Slider,
  Tooltip,
  InputAdornment,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  RestartAlt as ResetIcon,
  Save as SaveIcon,
  Help as HelpIcon,
} from '@mui/icons-material'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: theme.spacing(2),
    minWidth: 400,
    maxWidth: 600,
    maxHeight: '80vh',
    overflow: 'auto',
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  field: {
    marginBottom: theme.spacing(2),
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
  },
  addContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
  },
  sliderContainer: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}))

// Props interface without explicit type export
interface Props {
  model: {
    syntenyEndpoint: string
    maxResults: number
    enableAutoRefresh: boolean
    refreshInterval: number
    colorScheme: string
    minScore: number
    assemblyNames: string[]
    error: string | null
    isValidEndpoint: boolean
    setSyntenyEndpoint: (value: string) => void
    setMaxResults: (value: number) => void
    setEnableAutoRefresh: (value: boolean) => void
    setRefreshInterval: (value: number) => void
    setColorScheme: (value: string) => void
    setMinScore: (value: number) => void
    addAssemblyName: (name: string) => void
    removeAssemblyName: (index: number) => void
    resetToDefaults: () => void
  }
}

const DynamicSyntenyWidget: React.FC<Props> = observer(({ model }) => {
  const { classes } = useStyles()
  const [newAssembly, setNewAssembly] = useState('')
  const [showSaved, setShowSaved] = useState(false)

  const handleAddAssembly = () => {
    if (newAssembly.trim()) {
      model.addAssemblyName(newAssembly.trim())
      setNewAssembly('')
    }
  }

  const handleSave = () => {
    // Settings are auto-saved, but we show feedback
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }

  return (
    <Paper className={classes.root} elevation={0}>
      <Typography variant="h5" gutterBottom>
        Dynamic Synteny Configuration
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Configure settings for the Dynamic Synteny plugin. Changes are automatically saved.
      </Typography>

      {showSaved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      {model.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {model.error}
        </Alert>
      )}

      {/* API Settings Section */}
      <Box className={classes.section}>
        <Typography variant="h6" className={classes.sectionTitle}>
          API Settings
          <Tooltip title="Configure the data source for synteny information">
            <HelpIcon fontSize="small" color="action" />
          </Tooltip>
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <TextField
          className={classes.field}
          label="Synteny Endpoint URL"
          value={model.syntenyEndpoint}
          onChange={(e) => model.setSyntenyEndpoint(e.target.value)}
          fullWidth
          variant="outlined"
          size="small"
          error={!model.isValidEndpoint && model.syntenyEndpoint.length > 0}
          helperText={
            !model.isValidEndpoint && model.syntenyEndpoint.length > 0
              ? 'Please enter a valid URL'
              : 'The base URL for fetching synteny data'
          }
          InputProps={{
            endAdornment: model.isValidEndpoint ? (
              <InputAdornment position="end">✓</InputAdornment>
            ) : null,
          }}
        />

        <Box className={classes.field}>
          <Typography gutterBottom>
            Max Results: {model.maxResults}
          </Typography>
          <Box className={classes.sliderContainer}>
            <Slider
              value={model.maxResults}
              onChange={(_, value) => model.setMaxResults(value as number)}
              min={10}
              max={1000}
              step={10}
              marks={[
                { value: 10, label: '10' },
                { value: 500, label: '500' },
                { value: 1000, label: '1000' },
              ]}
            />
          </Box>
        </Box>

        <Box className={classes.field}>
          <Typography gutterBottom>
            Minimum Score: {model.minScore}
          </Typography>
          <Box className={classes.sliderContainer}>
            <Slider
              value={model.minScore}
              onChange={(_, value) => model.setMinScore(value as number)}
              min={0}
              max={100}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
              ]}
            />
          </Box>
        </Box>
      </Box>

      {/* Refresh Settings Section */}
      <Box className={classes.section}>
        <Typography variant="h6" className={classes.sectionTitle}>
          Auto-Refresh Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <FormControlLabel
          control={
            <Switch
              checked={model.enableAutoRefresh}
              onChange={(e) => model.setEnableAutoRefresh(e.target.checked)}
              color="primary"
            />
          }
          label="Enable Auto-Refresh"
        />

        {model.enableAutoRefresh && (
          <Box className={classes.field} sx={{ mt: 2 }}>
            <Typography gutterBottom>
              Refresh Interval: {model.refreshInterval} seconds
            </Typography>
            <Box className={classes.sliderContainer}>
              <Slider
                value={model.refreshInterval}
                onChange={(_, value) => model.setRefreshInterval(value as number)}
                min={5}
                max={300}
                step={5}
                marks={[
                  { value: 5, label: '5s' },
                  { value: 60, label: '1m' },
                  { value: 300, label: '5m' },
                ]}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Display Settings Section */}
      <Box className={classes.section}>
        <Typography variant="h6" className={classes.sectionTitle}>
          Display Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <FormControl fullWidth className={classes.field} size="small">
          <InputLabel>Color Scheme</InputLabel>
          <Select
            value={model.colorScheme}
            label="Color Scheme"
            onChange={(e) => model.setColorScheme(e.target.value)}
          >
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="viridis">Viridis</MenuItem>
            <MenuItem value="plasma">Plasma</MenuItem>
            <MenuItem value="rainbow">Rainbow</MenuItem>
            <MenuItem value="grayscale">Grayscale</MenuItem>
            <MenuItem value="colorblind">Colorblind Friendly</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Assembly Names Section */}
      <Box className={classes.section}>
        <Typography variant="h6" className={classes.sectionTitle}>
          Assembly Names
          <Tooltip title="Add assembly names to include in synteny comparisons">
            <HelpIcon fontSize="small" color="action" />
          </Tooltip>
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box className={classes.addContainer}>
          <TextField
            label="Add Assembly"
            value={newAssembly}
            onChange={(e) => setNewAssembly(e.target.value)}
            size="small"
            placeholder="e.g., hg38, mm10"
            onKeyPress={(e) => e.key === 'Enter' && handleAddAssembly()}
          />
          <IconButton onClick={handleAddAssembly} color="primary">
            <AddIcon />
          </IconButton>
        </Box>

        <Box className={classes.chipContainer}>
          {model.assemblyNames.map((name, index) => (
            <Chip
              key={index}
              label={name}
              onDelete={() => model.removeAssemblyName(index)}
              color="primary"
              variant="outlined"
            />
          ))}
          {model.assemblyNames.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              No assemblies configured. Add assembly names to enable comparisons.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Action Buttons */}
      <Divider sx={{ my: 2 }} />
      <Box className={classes.buttonContainer}>
        <Button
          variant="outlined"
          startIcon={<ResetIcon />}
          onClick={() => model.resetToDefaults()}
          color="secondary"
        >
          Reset to Defaults
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          color="primary"
        >
          Save Settings
        </Button>
      </Box>
    </Paper>
  )
})

export default DynamicSyntenyWidget
