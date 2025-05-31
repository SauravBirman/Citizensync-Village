import { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { getVillages, saveProfile } from '../services/api';

function VillageSelector() {
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    getVillages().then(setVillages);
  }, []);

  const handleSubmit = async () => {
    try {
      const updatedProfile = { ...user, selectedVillage };
      await saveProfile(updatedProfile);
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      window.location.href = '/dashboard';
    } catch (err) {
      alert('Failed to save village selection: ' + err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Select Your Village
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="village-select-label">Village</InputLabel>
        <Select
          labelId="village-select-label"
          value={selectedVillage}
          label="Village"
          onChange={(e) => setSelectedVillage(e.target.value)}
        >
          {villages.map((village) => (
            <MenuItem key={village} value={village}>{village}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained" onClick={handleSubmit} disabled={!selectedVillage}>
        Save
      </Button>
    </Box>
  );
}
export default VillageSelector;