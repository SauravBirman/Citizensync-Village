import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  Stack,
  useTheme
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { getNotifications, markNotificationRead } from '../services/api';

function Notifications() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [notifications, setNotifications] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    getNotifications(user.aadhaar).then(setNotifications);
  }, [user.aadhaar]);

  const handleMarkRead = async (notificationId) => {
    await markNotificationRead(notificationId);
    setNotifications(await getNotifications(user.aadhaar));
  };

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>

      {notifications.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No notifications available.
        </Typography>
      ) : (
        notifications.map((notification, index) => (
          <Card
            key={notification.id}
            sx={{
              mb: 2,
              backgroundColor: notification.read ? '#f9f9f9' : '#e8f4fd',
              transition: '0.3s',
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.timestamp?.seconds * 1000).toLocaleString()}
                  </Typography>
                </Stack>
                <Chip
                  size="small"
                  label={notification.read ? 'Read' : 'Unread'}
                  color={notification.read ? 'default' : 'primary'}
                  icon={notification.read ? <DoneAllIcon fontSize="small" /> : <NotificationsNoneIcon fontSize="small" />}
                  variant="outlined"
                />
              </Stack>

              {!notification.read && (
                <Box mt={2}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleMarkRead(notification.id)}
                  >
                    Mark as Read
                  </Button>
                </Box>
              )}
            </CardContent>
            {index !== notifications.length - 1 && <Divider />}
          </Card>
        ))
      )}
    </Box>
  );
}

export default Notifications;
