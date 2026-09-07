import React, { useState } from 'react';
import {
  Box, Container, Typography, TextField, Button, Grid, Card, CardContent, CircularProgress, Alert, MenuItem
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';

const CreateTelephonyProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    provider: 'twilio',
    callerId: '',
    isDefault: false
  });

  const [credentials, setCredentials] = useState({
    accountSid: '',
    authToken: '',
    apiKey: '',
    apiSecret: '',
    applicationId: '',
    privateKey: ''
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCredChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        credentials: { ...credentials }
      };

      await api.post('/telephony-profile', payload);
      navigate('/console/telephony-profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0b0f19' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/console/telephony-profile')}
            sx={{ color: '#94a3b8', mb: 3, '&:hover': { color: '#f8fafc' } }}
          >
            Back to Profiles
          </Button>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 800 }}>
              Create Telephony Profile
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', mt: 1 }}>
              Add a new Voice API provider for Vishing simulations.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}

          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px' }}>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Profile Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Primary Twilio"
                      InputProps={{ style: { color: '#f8fafc' } }}
                      sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Provider"
                      name="provider"
                      value={formData.provider}
                      onChange={handleChange}
                      required
                      InputProps={{ style: { color: '#f8fafc' } }}
                      sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                    >
                      <MenuItem value="twilio">Twilio</MenuItem>
                      <MenuItem value="plivo">Plivo</MenuItem>
                      <MenuItem value="vonage">Vonage</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Caller ID Phone Number"
                      name="callerId"
                      value={formData.callerId}
                      onChange={handleChange}
                      required
                      placeholder="+1234567890"
                      helperText="Must be a purchased number in E.164 format"
                      InputProps={{ style: { color: '#f8fafc' } }}
                      sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } }, '& .MuiFormHelperText-root': { color: '#94a3b8' } }}
                    />
                  </Grid>

                  {/* Dynamic Credential Fields based on Provider */}
                  {(formData.provider === 'twilio' || formData.provider === 'plivo') && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Account SID / Auth ID"
                          name="accountSid"
                          value={credentials.accountSid}
                          onChange={handleCredChange}
                          required
                          InputProps={{ style: { color: '#f8fafc' } }}
                          sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="password"
                          label="Auth Token"
                          name="authToken"
                          value={credentials.authToken}
                          onChange={handleCredChange}
                          required
                          InputProps={{ style: { color: '#f8fafc' } }}
                          sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                        />
                      </Grid>
                    </>
                  )}

                  {formData.provider === 'vonage' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Application ID"
                          name="applicationId"
                          value={credentials.applicationId}
                          onChange={handleCredChange}
                          required
                          InputProps={{ style: { color: '#f8fafc' } }}
                          sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="API Key"
                          name="apiKey"
                          value={credentials.apiKey}
                          onChange={handleCredChange}
                          required
                          InputProps={{ style: { color: '#f8fafc' } }}
                          sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          type="password"
                          label="API Secret"
                          name="apiSecret"
                          value={credentials.apiSecret}
                          onChange={handleCredChange}
                          required
                          InputProps={{ style: { color: '#f8fafc' } }}
                          sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Private Key (PKCS8)"
                          name="privateKey"
                          value={credentials.privateKey}
                          onChange={handleCredChange}
                          required
                          placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                          InputProps={{ style: { color: '#f8fafc', fontFamily: 'monospace', fontSize: '0.85rem' } }}
                          sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        sx={{
                          bgcolor: '#3b82f6',
                          color: '#fff',
                          fontWeight: 700,
                          py: 1.5,
                          px: 4,
                          borderRadius: '8px',
                          '&:hover': { bgcolor: '#2563eb' }
                        }}
                      >
                        {loading ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Container>
        <Footer />
      </Box>
    </Box>
  );
};

export default CreateTelephonyProfile;
