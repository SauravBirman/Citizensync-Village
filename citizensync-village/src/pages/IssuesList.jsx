import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import IssueCard from '../components/IssueCard';
import { getIssues } from '../services/api';

function IssuesList({ status }) {
  const [issues, setIssues] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchIssues = async () => {
    try {
      let filteredIssues = await getIssues();
      if (user.role === 'Tehsil Officer') {
        filteredIssues = filteredIssues.filter(
          (issue) => issue.status === status && issue.escalatedTo === 'Tehsil Officer'
        );
      } else {
        filteredIssues = filteredIssues.filter(
          (issue) => issue.village === user.selectedVillage && issue.status === status
        );
      }
      if (user.role === 'Sarpanch' && status === 'Open') {
        filteredIssues = filteredIssues.sort((a, b) => (b.urgentVotes || 0) - (a.urgentVotes || 0));
      }
      setIssues(filteredIssues);
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [user.selectedVillage, user.role, status]);

  // Calculate total issues and votes
  const totalIssues = issues.length;
  const totalUrgentVotes = issues.reduce((sum, issue) => sum + (issue.urgentVotes || 0), 0);
  const totalNotUrgentVotes = issues.reduce((sum, issue) => sum + (issue.notUrgentVotes || 0), 0);

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)', // Adjust for Navbar height (AppBar default height is 64px)
      width: '100vw', // Full width
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f5f5f5', // Light background for contrast
      paddingTop: '20px', // Space below Navbar
      boxSizing: 'border-box',
    }}>
      <Card sx={{ 
        borderRadius: '0', // Remove border radius for full-screen edge-to-edge look
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        flexGrow: 1, // Allow the card to grow and fill the space
        overflow: 'auto', // Allow scrolling if content overflows
        margin: 0, // Remove any margins
      }}>
        {/* Header Section */}
        <Box sx={{
          background: 'linear-gradient(135deg, #ffeb3b, #ff9800)',
          padding: { xs: '16px', sm: '24px' }, // Responsive padding
          textAlign: 'center',
          color: '#1a3c34',
          position: 'sticky', // Keep header sticky at the top
          top: 0,
          zIndex: 1,
        }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {status === 'Open' ? 'Current Issues' : 'Solved Issues'}{user.role === 'Tehsil Officer' ? ' Across All Villages' : ` in ${user.selectedVillage}`}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {user.role === 'Sarpanch' && status === 'Open' 
              ? 'Sorted by Urgent Votes (Highest First)' 
              : user.role === 'Tehsil Officer' && status === 'Open'
              ? 'Escalated Issues Due to Sarpanch Inaction'
              : `Viewing as ${user.role}`}
            {` | Total: ${totalIssues} Issues, Urgent Votes: ${totalUrgentVotes}, Not Urgent Votes: ${totalNotUrgentVotes}`}
          </Typography>
        </Box>

        {/* Issues Content */}
        <CardContent sx={{ 
          padding: { xs: '16px', sm: '32px' }, // Responsive padding
          paddingTop: 0, // Avoid double padding with header
          flexGrow: 1, // Allow content to grow
        }}>
          {issues.length === 0 ? (
            <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
              No {status === 'Open' ? 'current' : 'solved'} issues reported yet.
            </Typography>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: { xs: '12px', sm: '16px' }, // Responsive gap
              maxWidth: '1200px', // Optional: cap content width for readability on very large screens
              mx: 'auto', // Center content within the full-width card
              width: '100%',
            }}>
              {issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  userRole={user.role}
                  onIssueUpdated={fetchIssues}
                  colorScheme={{
                    primary: '#2e7d32',
                    primaryHover: '#1b5e20',
                    textPrimary: '#1a3c34',
                    textSecondary: 'text.secondary',
                  }}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default IssuesList;