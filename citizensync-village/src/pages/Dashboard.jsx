import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Bar } from 'react-chartjs-2';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { getIssueAnalytics, getNotifications, getAnnouncements } from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Fix Leaflet marker icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [analytics, setAnalytics] = useState({ openCount: 0, solvedCount: 0, topVoted: [] });
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    getIssueAnalytics(user.selectedVillage).then((data) => {
      setAnalytics(data);
      setIssues(data.topVoted.filter((issue) => issue.lat && issue.lng));
    });
    getNotifications(user.aadhaar).then(setNotifications);
    getAnnouncements(user.selectedVillage).then(setAnnouncements);
  }, [user.selectedVillage, user.aadhaar]);

  // Mock village coordinates (replace with real data if available)
  const villageCoords = {
    'Village A': [28.2289372, 75.9738087],
    'Village B': [28.26962,	75.97646],
    'Village C': [28.248660,	75.962820],
    'Village D': [28.204653, 75.874878],
  };

  // Define chart data
  const chartData = {
    labels: ['Open Issues', 'Solved Issues'],
    datasets: [
      {
        label: 'Issue Count',
        data: [analytics.openCount, analytics.solvedCount],
        backgroundColor: ['#1976d2', '#4caf50'],
        borderColor: ['#1565c0', '#388e3c'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      title: { display: true, text: 'Issue Status' },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Count' },
      },
      x: {
        title: { display: true, text: 'Status' },
      },
    },
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Dashboard - {user.selectedVillage}
      </Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>Issue Analytics</Typography>
      <Bar data={chartData} options={chartOptions} />
      <Typography variant="h6" sx={{ mt: 2 }}>Top Voted Open Issues</Typography>
      {analytics.topVoted.length === 0 ? (
        <Typography>No open issues.</Typography>
      ) : (
        <List>
          {analytics.topVoted.map((issue) => (
            <ListItem key={issue.id}>
              <ListItemText
                primary={`${issue.description} (Urgent Votes: ${issue.urgentVotes || 0})`}
                secondary={`Comments: ${issue.commentCount || 0}`}
              />
            </ListItem>
          ))}
        </List>
      )}
      <Typography variant="h6" sx={{ mt: 2 }}>Village Map</Typography>
      <MapContainer
        center={villageCoords[user.selectedVillage] || [51.505, -0.09]}
        zoom={13}
        style={{ height: '400px', marginBottom: '20px' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {issues.map((issue) => (
          <Marker key={issue.id} position={[issue.lat, issue.lng]} />
        ))}
      </MapContainer>
      <Typography variant="h6" sx={{ mt: 2 }}>Recent Notifications</Typography>
      {notifications.length === 0 ? (
        <Typography>No notifications.</Typography>
      ) : (
        <List>
          {notifications.slice(0, 3).map((notification) => (
            <ListItem key={notification.id}>
              <ListItemText
                primary={notification.message}
                secondary={new Date(notification.timestamp?.seconds * 1000).toLocaleString()}
                sx={{ opacity: notification.read ? 0.6 : 1 }}
              />
            </ListItem>
          ))}
        </List>
      )}
      <Typography variant="h6" sx={{ mt: 2 }}>Recent Announcements</Typography>
      {announcements.length === 0 ? (
        <Typography>No announcements.</Typography>
      ) : (
        <List>
          {announcements.slice(0, 3).map((announcement) => (
            <ListItem key={announcement.id}>
              <ListItemText
                primary={announcement.title}
                secondary={`${announcement.message} - ${new Date(announcement.timestamp?.seconds * 1000).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
export default Dashboard;