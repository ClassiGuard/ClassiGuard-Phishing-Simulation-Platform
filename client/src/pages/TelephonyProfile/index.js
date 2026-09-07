import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent, Chip, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert
} from '@mui/material';
import { Add as AddIcon, Phone as PhoneIcon, DeleteOutline as DeleteOutlineIcon, Star as StarIcon, VpnKey as VpnKeyIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';

const TelephonyProfile = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/telephony-profile');
      setProfiles(res.data.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch telephony profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this telephony profile?")) {
      try {
        await api.delete(`/telephony-profile/${id}`);
        setProfiles(profiles.filter((p) => p._id !== id));
      } catch (err) {
        alert("Failed to delete profile");
      }
    }
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'twilio': return { label: 'Twilio', color: 'error' };
      case 'plivo': return { label: 'Plivo', color: 'success' };
      case 'vonage': return { label: 'Vonage', color: 'info' };
      default: return { label: provider, color: 'default' };
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0b0f19' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 800, letterSpacing: '-0.5px' }}>
                Telephony Profiles
              </Typography>
              <Typography variant="body1" sx={{ color: '#94a3b8', mt: 1 }}>
                Manage voice API providers for Vishing campaigns.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/console/telephony-profile/create')}
              sx={{
                bgcolor: '#3b82f6',
                color: '#ffffff',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
                py: 1.2,
                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                '&:hover': { bgcolor: '#2563eb' }
              }}
            >
              Add Telephony Profile
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#3b82f6' }} />
            </Box>
          ) : profiles.length === 0 ? (
            <Card sx={{ bgcolor: '#111827', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', textAlign: 'center', py: 8, boxShadow: 'none' }}>
              <PhoneIcon sx={{ fontSize: 64, color: '#334155', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 700 }}>No Telephony Profiles Found</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1, mb: 3 }}>Configure Twilio, Plivo, or Vonage to start Vishing.</Typography>
              <Button variant="outlined" onClick={() => navigate('/console/telephony-profile/create')} sx={{ color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.5)', borderRadius: '8px' }}>
                Create First Profile
              </Button>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {profiles.map((profile) => {
                const prov = getProviderColor(profile.provider);

                return (
                  <Grid item xs={12} md={6} lg={4} key={profile._id}>
                    <Card
                      sx={{
                        bgcolor: '#111827',
                        border: profile.isDefault ? '1px solid rgba(59, 130, 246, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        transition: 'all 0.25s ease',
                        position: 'relative',
                        boxShadow: profile.isDefault ? '0 0 20px rgba(59, 130, 246, 0.15)' : 'none',
                        '&:hover': {
                          borderColor: 'rgba(59, 130, 246, 0.4)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                        },
                      }}
                    >
                      {profile.isDefault && (
                        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                          <Chip icon={<StarIcon sx={{ fontSize: '0.9rem !important', color: '#fbbf24 !important' }} />} label="Default Voice" size="small" sx={{ bgcolor: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', fontWeight: 700, border: '1px solid rgba(251, 191, 36, 0.3)' }} />
                        </Box>
                      )}

                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 700, mb: 0.5 }}>
                            {profile.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            Caller ID: {profile.callerId}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                          <Chip
                            size="small"
                            label={prov.label}
                            color={prov.color}
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <Tooltip title="Delete Profile">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(profile._id)}
                              sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

        </Container>
        <Footer />
      </Box>
    </Box>
  );
};

export default TelephonyProfile;
