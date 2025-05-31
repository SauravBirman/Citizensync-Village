import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import { postAnnouncement, getAnnouncements } from '../services/api';

function Announcements() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getAnnouncements(user.selectedVillage).then(setAnnouncements);
  }, [user.selectedVillage]);

  const handlePost = async () => {
    if (!title || !message) return;
    try {
      await postAnnouncement({
        village: user.selectedVillage,
        title,
        message,
        postedBy: user.name,
      });
      setTitle('');
      setMessage('');
      setAnnouncements(await getAnnouncements(user.selectedVillage));
    } catch (err) {
      console.error('Error posting announcement:', err);
    }
  };

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: 900, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>📢 Announcements</Typography>

      {user.role === 'Sarpanch' && (
        <Box sx={{ mb: 4 }}>
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Message"
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handlePost}
            disabled={!title || !message}
          >
            Post Announcement
          </Button>
        </Box>
      )}

      {announcements.length === 0 ? (
        <Typography>No announcements.</Typography>
      ) : (
        <Grid container spacing={3}>
          {announcements.map((announcement) => (
            <Grid item xs={12} sm={6} key={announcement.id}>
              <Card elevation={3}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                    <Avatar sx={{ bgcolor: '#1976d2' }}>
                      <CampaignIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{announcement.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(announcement.timestamp?.seconds * 1000).toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography sx={{ mb: 1 }}>{announcement.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    — Posted by {announcement.postedBy}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Announcements;
