import { Box, Typography } from '@mui/material';

function Comment({ comment }) {
  return (
    <Box sx={{ mb: 1, pl: 2, borderLeft: '2px solid #1976d2' }}>
      <Typography variant="body2" color="textSecondary">
        {comment.user.name} - {new Date(comment.timestamp?.seconds * 1000).toLocaleString()}
      </Typography>
      <Typography>{comment.text}</Typography>
    </Box>
  );
}
export default Comment;