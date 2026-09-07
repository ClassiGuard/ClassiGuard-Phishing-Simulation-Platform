import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Link,
  useTheme,
  useMediaQuery,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Security as SecurityIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useLogin } from '../../hooks/useLogin';
import './Login.css';

export default function SignIn() {
  const { handleSubmit, loading, error } = useLogin();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const searchParams = new URLSearchParams(location.search);
  const reason = searchParams.get('reason');
  const timeout = searchParams.get('timeout') || '15';

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    // Assuming a forgot-password route exists or could be built later
    navigate('/forgot-password');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw', bgcolor: '#020617', overflow: 'hidden' }}>
      
      {/* LEFT SIDE - LOGIN FORM */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 450px', lg: '0 0 500px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 4, sm: 8, md: 6, lg: 8 },
          position: 'relative',
          zIndex: 10,
          bgcolor: 'rgba(2, 6, 23, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '10px 0 50px rgba(0,0,0,0.5)',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto' }}>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 6, gap: 1.5 }}>
            <SecurityIcon sx={{ color: '#00f2fe', fontSize: 32, filter: 'drop-shadow(0 0 8px rgba(0,242,254,0.6))' }} />
            <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 800, letterSpacing: '0.5px' }}>
              CyPhish
            </Typography>
          </Box>

          <Typography component="h1" variant="h4" sx={{ color: '#f8fafc', fontWeight: 800, mb: 1 }}>
            Welcome Back!
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
            Secure access to your cybersecurity dashboard.
          </Typography>

          {reason === 'inactivity' && (
            <Alert severity="warning" sx={{ mb: 3, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)', '& .MuiAlert-icon': { color: '#fbbf24' } }}>
              Logged out after {timeout} minutes of inactivity.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', '& .MuiAlert-icon': { color: '#f87171' } }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            
            <Typography variant="subtitle2" sx={{ color: '#cbd5e1', mb: 1, fontWeight: 600 }}>Username</Typography>
            <TextField
              margin="none"
              required
              fullWidth
              id="username"
              name="username"
              placeholder="Enter your username"
              autoComplete="username"
              autoFocus
              variant="outlined"
              sx={customTextFieldStyle}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#64748b', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>Password</Typography>
              <Link 
                href="#" 
                onClick={handleForgotPassword}
                sx={{ 
                  color: '#a855f7', 
                  fontSize: '0.875rem', 
                  textDecoration: 'none', 
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  '&:hover': { color: '#c084fc', textShadow: '0 0 8px rgba(168,85,247,0.4)' }
                }}
              >
                Forgot password?
              </Link>
            </Box>
            
            <TextField
              margin="none"
              required
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              variant="outlined"
              sx={customTextFieldStyle}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#64748b', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      sx={{ color: '#64748b' }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 4,
                mb: 3,
                py: 1.5,
                background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)',
                color: '#020617',
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(0, 242, 254, 0.4)',
                transition: 'all 0.3s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                  boxShadow: '0 6px 20px rgba(0, 242, 254, 0.6)',
                  transform: 'translateY(-1px)',
                },
                '&.Mui-disabled': {
                  background: '#334155',
                  color: '#94a3b8',
                  boxShadow: 'none',
                }
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
            
            {/* Note: The signup button has been explicitly removed as requested. Only admins can create users. */}
            
          </Box>
        </Box>
        
        {/* Footer info */}
        <Box sx={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#475569' }}>
            © {new Date().getFullYear()} CyPhish Inc. | Admin Portal
          </Typography>
        </Box>
      </Box>

      {/* RIGHT SIDE - CYBER VISUAL */}
      {isMdUp && (
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            bgcolor: '#020617',
            background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
          }}
        >
          {/* Cyber Grid Background */}
          <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            zIndex: 1,
          }} />

          {/* Glowing Orbs */}
          <Box sx={{ position: 'absolute', top: '20%', left: '30%', width: '300px', height: '300px', background: 'rgba(168, 85, 247, 0.15)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 1 }} />
          <Box sx={{ position: 'absolute', bottom: '20%', right: '20%', width: '400px', height: '400px', background: 'rgba(0, 242, 254, 0.1)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 1 }} />
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', background: 'rgba(56, 189, 248, 0.05)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 1 }} />

          {/* Central Shield Graphic */}
          <Box sx={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{
              position: 'relative',
              width: '200px',
              height: '240px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
            }}>
              {/* Shield Base */}
              <SecurityIcon sx={{ 
                fontSize: 240, 
                color: 'transparent', 
                stroke: '#00f2fe', 
                strokeWidth: 0.5,
                filter: 'drop-shadow(0 0 20px rgba(0,242,254,0.4)) drop-shadow(0 0 60px rgba(0,242,254,0.2))',
                position: 'absolute',
              }} />
              {/* Inner Shield / Accents */}
              <SecurityIcon sx={{ 
                fontSize: 160, 
                color: 'transparent', 
                stroke: '#a855f7', 
                strokeWidth: 1,
                filter: 'drop-shadow(0 0 15px rgba(168,85,247,0.6))',
                position: 'absolute',
                animation: 'pulse 3s infinite',
              }} />
              <Typography variant="h2" sx={{ 
                color: '#ffffff', 
                fontWeight: 900, 
                position: 'absolute',
                textShadow: '0 0 20px rgba(255,255,255,0.5)',
                fontFamily: 'monospace'
              }}>
                C
              </Typography>
            </Box>

            {/* Floating connecting lines & nodes simulation via CSS */}
            <Typography variant="h6" sx={{ color: '#00f2fe', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 700, filter: 'drop-shadow(0 0 8px rgba(0,242,254,0.5))' }}>
              Threat Detection Active
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 4, mt: 4 }}>
              <Box sx={metricBoxStyle}>
                <Typography sx={metricValueStyle}>Secure</Typography>
                <Typography sx={metricLabelStyle}>Connection</Typography>
              </Box>
              <Box sx={metricBoxStyle}>
                <Typography sx={metricValueStyle}>Encrypted</Typography>
                <Typography sx={metricLabelStyle}>Traffic</Typography>
              </Box>
              <Box sx={metricBoxStyle}>
                <Typography sx={metricValueStyle}>Shielded</Typography>
                <Typography sx={metricLabelStyle}>Infrastructure</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

// Reusable styles for the custom text fields
const customTextFieldStyle = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '8px',
    color: '#f8fafc',
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#00f2fe',
      borderWidth: '1px',
      boxShadow: '0 0 10px rgba(0, 242, 254, 0.25)',
    },
    '& input::placeholder': {
      color: '#475569',
      opacity: 1,
    }
  }
};

const metricBoxStyle = {
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center',
  bgcolor: 'rgba(15, 23, 42, 0.5)',
  border: '1px solid rgba(255,255,255,0.05)',
  backdropFilter: 'blur(4px)',
  borderRadius: '8px',
  px: 3,
  py: 1.5
};

const metricValueStyle = {
  color: '#e2e8f0', 
  fontWeight: 700, 
  fontSize: '0.9rem'
};

const metricLabelStyle = {
  color: '#64748b', 
  fontSize: '0.7rem', 
  textTransform: 'uppercase', 
  letterSpacing: '1px', 
  mt: 0.5
};
