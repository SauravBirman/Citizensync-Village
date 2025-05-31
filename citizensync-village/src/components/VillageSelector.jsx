import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function VillageSelector({ villages, selectedVillage, setSelectedVillage }) {
  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Select Village</InputLabel>
      <Select
        value={selectedVillage}
        onChange={(e) => setSelectedVillage(e.target.value)}
        label="Select Village"
      >
        {villages.map((village) => (
          <MenuItem key={village} value={village}>{village}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
export default VillageSelector;