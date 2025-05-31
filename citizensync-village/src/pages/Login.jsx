import { useState, useEffect } from 'react';
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authenticateUser, saveProfile, getVillages } from '../services/api';
import VillageSelector from '../components/VillageSelector';

function Login() {
  const [aadhaar, setAadhaar] = useState('');
  const [role, setRole] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [villages, setVillages] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getVillages().then((villages) => {
      setVillages(villages);
    }).catch((err) => {
      setError('Failed to load villages: ' + err.message);
    });
  }, []);

  const handleLogin = async () => {
    setError('');
    if (!/^\d{12}$/.test(aadhaar)) {
      setError('Aadhaar must be a 12-digit number');
      return;
    }
    if (!role) {
      setError('Please select a role');
      return;
    }
    try {
      const user = await authenticateUser(aadhaar, role);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
      } else {
        setError('User not found or incorrect role. Please sign up or check details.');
      }
    } catch (err) {
      setError(`Login failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleSignUp = async () => {
    setError('');
    if (!/^\d{12}$/.test(aadhaar)) {
      setError('Aadhaar must be a 12-digit number');
      return;
    }
    if (!role || !name || !mobile || !address) {
      setError('Please fill all required fields');
      return;
    }
    if (role !== 'Tehsil Officer' && !selectedVillage) {
      setError('Please select a village');
      return;
    }
    try {
      const profile = {
        aadhaar,
        role,
        selectedVillage: role === 'Tehsil Officer' ? 'All Villages' : selectedVillage,
        name,
        mobile,
        email,
        address,
      };
      await saveProfile(profile);
      localStorage.setItem('user', JSON.stringify(profile));
      navigate('/');
    } catch (err) {
      setError(`Sign-up failed: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '400px', margin: 'auto', mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        {isSignUp ? 'Sign Up for CitizenSync' : 'Login to CitizenSync'}
      </Typography>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          label="Aadhaar Number (12 digits)"
          value={aadhaar}
          onChange={(e) => setAadhaar(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Role</InputLabel>
        <Select value={role} onChange={(e) => setRole(e.target.value)} label="Role">
          <MenuItem value="Villager">Villager</MenuItem>
          <MenuItem value="Sarpanch">Sarpanch</MenuItem>
          <MenuItem value="Tehsil Officer">Tehsil Officer</MenuItem>
        </Select>
      </FormControl>
      {isSignUp && (
        <>
          {role !== 'Tehsil Officer' && (
            <VillageSelector
              villages={villages}
              selectedVillage={selectedVillage}
              setSelectedVillage={setSelectedVillage}
            />
          )}
          <TextField
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Mobile Number"
            fullWidth
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email ID (Optional)"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Address"
            fullWidth
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            sx={{ mb: 2 }}
            multiline
          />
        </>
      )}
      <Button
        variant="contained"
        onClick={isSignUp ? handleSignUp : handleLogin}
        disabled={!aadhaar || !role || (isSignUp && (!name || !mobile || !address || (role !== 'Tehsil Officer' && !selectedVillage)))}
        sx={{ mr: 2 }}
      >
        {isSignUp ? 'Sign Up' : 'Login'}
      </Button>
      <Button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Back to Login' : 'Sign Up'}
      </Button>
    </Box>
  );
}

export default Login;