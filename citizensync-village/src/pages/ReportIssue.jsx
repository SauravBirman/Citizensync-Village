import { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { submitIssue, prioritizeIssue } from '../services/api';

function ReportIssue() {
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [file, setFile] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || {});
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!description) {
      setError('Description is required');
      return;
    }
    try {
      const priority = prioritizeIssue(description);
      await submitIssue({
        description,
        address,
        location,
        village: user.selectedVillage,
        status: 'Open',
        priority,
        reportedBy: { name: user.name, mobile: user.mobile, aadhaar: user.aadhaar },
      });
      setDescription('');
      setAddress('');
      setLocation(null);
      setFile(null);
    } catch (err) {
      setError('Failed to submit issue');
    }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setError('Unable to get location')
    );
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <Typography variant="h6">Report an Issue in {user.selectedVillage}</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Description"
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 2 }}
        multiline
      />
      <TextField
        label="Address of Issue"
        fullWidth
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        type="file"
        label="Attach File (Optional, Not Functional)"
        fullWidth
        onChange={(e) => setFile(e.target.files[0])}
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
        disabled
      />
      <Button onClick={getLocation} sx={{ mr: 2, mb: 2 }}>Get Location</Button>
      <Button onClick={handleSubmit} variant="contained" disabled={!description}>
        Submit
      </Button>
    </Box>
  );
}
export default ReportIssue;