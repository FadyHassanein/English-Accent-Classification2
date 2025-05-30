import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Grid,
  Divider,
  Stack
} from '@mui/material';
import {
  Language,
  Link as LinkIcon,
  Analytics,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [urlError, setUrlError] = useState('');

  const validateUrl = (inputUrl) => {
    try {
      new URL(inputUrl);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    
    if (inputUrl && !validateUrl(inputUrl)) {
      setUrlError('Please enter a valid URL');
    } else {
      setUrlError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) {
      setUrlError('URL is required');
      return;
    }
    
    if (!validateUrl(url)) {
      setUrlError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:8000/classify_dialect/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Classification failed');
      }

      setResults(data.results);
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  const getDialectFlag = (dialect) => {
    const flags = {
      'us': '🇺🇸',
      'england': '🇬🇧',
      'australia': '🇦🇺',
      'canada': '🇨🇦',
      'indian': '🇮🇳',
      'ireland': '🇮🇪',
      'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'south_africa': '🇿🇦'
    };
    return flags[dialect.toLowerCase()] || '🌍';
  };

  const getDialectLabel = (dialect) => {
    const labels = {
      'us': 'American English',
      'england': 'British English',
      'australia': 'Australian English',
      'canada': 'Canadian English',
      'indian': 'Indian English',
      'ireland': 'Irish English',
      'scotland': 'Scottish English',
      'south_africa': 'South African English'
    };
    return labels[dialect.toLowerCase()] || dialect.charAt(0).toUpperCase() + dialect.slice(1);
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Language sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            English Dialect Classifier
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            AI-powered English accent detection for hiring evaluation
          </Typography>
          <Chip 
            icon={<Analytics />} 
            label="Powered by Transformers AI" 
            color="primary" 
            variant="outlined" 
          />
        </Box>

        {/* Form */}
        <Card elevation={1} sx={{ mb: 4 }}>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinkIcon /> Video URL Input
              </Typography>
              <TextField
                fullWidth
                label="Enter video URL (YouTube, Loom, MP4, etc.)"
                value={url}
                onChange={handleUrlChange}
                error={!!urlError}
                helperText={urlError || "Supports YouTube, Loom, direct video links, and more"}
                placeholder="https://example.com/video.mp4"
                sx={{ mb: 3 }}
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || !!urlError || !url}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    Processing Audio...
                  </Box>
                ) : (
                  'Classify Dialect'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card elevation={1} sx={{ mb: 4 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Analyzing Audio...
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Downloading video, extracting audio, and classifying dialect
              </Typography>
              <LinearProgress />
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Alert 
            severity="error" 
            icon={<ErrorIcon />}
            sx={{ mb: 4 }}
            onClose={() => setError('')}
          >
            <Typography variant="h6">Classification Failed</Typography>
            {error}
          </Alert>
        )}

        {/* Results */}
        {results && (
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <CheckCircle color="success" />
                <Typography variant="h5" fontWeight="bold">
                  Classification Results
                </Typography>
              </Box>

              {/* Primary Result */}
              <Card 
                elevation={3} 
                sx={{ 
                  mb: 3, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ mb: 1 }}>
                    {getDialectFlag(results[0].label)}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {getDialectLabel(results[0].label)}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Confidence: {(results[0].score * 100).toFixed(1)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={results[0].score * 100}
                    sx={{ 
                      mt: 2, 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white'
                      }
                    }}
                  />
                </CardContent>
              </Card>

              <Divider sx={{ my: 3 }} />

              {/* All Results */}
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Detailed Analysis
              </Typography>
              <Grid container spacing={2}>
                {results.map((result, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        height: '100%',
                        border: index === 0 ? 2 : 1,
                        borderColor: index === 0 ? 'primary.main' : 'divider'
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ mb: 1 }}>
                          {getDialectFlag(result.label)}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {getDialectLabel(result.label)}
                        </Typography>
                        <Stack spacing={1} alignItems="center">
                          <Chip
                            label={`${(result.score * 100).toFixed(1)}%`}
                            color={getConfidenceColor(result.score)}
                            size="small"
                          />
                          <LinearProgress
                            variant="determinate"
                            value={result.score * 100}
                            color={getConfidenceColor(result.score)}
                            sx={{ width: '100%', height: 6, borderRadius: 3 }}
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Hiring Recommendation */}
              <Card elevation={1} sx={{ mt: 3, backgroundColor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    💼 Hiring Evaluation Summary
                  </Typography>
                  <Typography variant="body1">
                    <strong>Primary Dialect:</strong> {getDialectLabel(results[0].label)} 
                    ({(results[0].score * 100).toFixed(1)}% confidence)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {results[0].score >= 0.8 
                      ? "High confidence classification - suitable for role-specific accent requirements"
                      : results[0].score >= 0.6
                      ? "Moderate confidence - may require additional evaluation"
                      : "Low confidence - recommend manual review or additional audio samples"
                    }
                  </Typography>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Container>
  );
}

export default App;
