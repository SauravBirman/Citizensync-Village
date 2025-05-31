import { useState, useEffect } from 'react';
import { Box, Typography, Button, Avatar, Card, CardContent, Grid, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/api';
import PersonIcon from '@mui/icons-material/Person';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import FingerprintIcon from '@mui/icons-material/Fingerprint';

function Home() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null); // Add state for error handling
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Redirect to login if user.aadhaar is missing
    if (!user.aadhaar) {
      navigate('/login');
      return;
    }

    // Fetch profile
    const fetchProfile = async () => {
      try {
        const profileData = await getProfile(user.aadhaar);
        if (!profileData) {
          setError('Profile not found. Please ensure your account exists.');
          return;
        }
        setProfile(profileData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again later.');
      }
    };

    fetchProfile();
  }, [user.aadhaar, navigate]);

  const handleNavigateToIssues = () => {
    console.log('User before navigation:', user);
    console.log('localStorage user:', localStorage.getItem('user'));
    if (!user.aadhaar) {
      console.log('No user aadhaar found, redirecting to login');
      navigate('/login');
      return;
    }
    navigate('/issues');
  };

  // Show error message if profile fetch fails
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: '800px', 
      margin: '40px auto',
      padding: '0 20px'
    }}>
      <Card sx={{ 
        borderRadius: '16px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header Section */}
        <Box sx={{
          background: 'linear-gradient(135deg, #ffeb3b, #ff9800)',
          padding: '24px',
          textAlign: 'center',
          color: '#1a3c34'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            CitizenSync Village
          </Typography>
          <Typography variant="subtitle1">
            Welcome, {user.role || 'User'}
          </Typography>
        </Box>

        {/* Profile Content */}
        <CardContent sx={{ padding: '32px' }}>
          {profile ? (
            <>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 4
              }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: '#2e7d32',
                  mb: 2,
                  fontSize: '2rem'
                }}>
                  {profile.name.charAt(0)}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {profile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aadhaar: {user.aadhaar}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SmartphoneIcon color="primary" sx={{ mr: 2 }} />
                    <Typography>
                      <Box component="span" sx={{ fontWeight: 600, mr: 1 }}>Mobile:</Box>
                      {profile.mobile}
                    </Typography>
                  </Box>
                </Grid>

                {profile.email && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon color="primary" sx={{ mr: 2 }} />
                      <Typography>
                        <Box component="span" sx={{ fontWeight: 600, mr: 1 }}>Email:</Box>
                        {profile.email}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon color="primary" sx={{ mr: 2 }} />
                    <Typography>
                      <Box component="span" sx={{ fontWeight: 600, mr: 1 }}>Address:</Box>
                      {profile.address}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HomeIcon color="primary" sx={{ mr: 2 }} />
                    <Typography>
                      <Box component="span" sx={{ fontWeight: 600, mr: 1 }}>Village:</Box>
                      {profile.selectedVillage}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 4 
              }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleNavigateToIssues}
                  sx={{
                    bgcolor: '#2e7d32',
                    '&:hover': { bgcolor: '#1b5e20' },
                    borderRadius: '8px',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem'
                  }}
                >
                  Go to Issues
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px'
            }}>
              <Typography variant="h6">Loading profile...</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Home;