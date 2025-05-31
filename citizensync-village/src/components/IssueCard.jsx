import { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Button, Box, TextField,
  Table, TableBody, TableCell, TableContainer, TableRow, Paper, Divider, Stack
} from '@mui/material';
import {
  voteIssue, resolveIssue, addComment, getComments, hasVoted,
  voteSatisfaction, hasVotedSatisfaction
} from '../services/api';
import Comment from './Comment';

function IssueCard({ issue, userRole, onIssueUpdated }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [hasUserVoted, setHasUserVoted] = useState(false);
  const [hasUserVotedSatisfaction, setHasUserVotedSatisfaction] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    hasVoted(issue.id, user.aadhaar).then(setHasUserVoted);
    hasVotedSatisfaction(issue.id, user.aadhaar).then(setHasUserVotedSatisfaction);
    getComments(issue.id).then(setComments);

    // Timer for Sarpanch: Calculate time left until 5-day deadline
    if (userRole === 'Sarpanch' && issue.status === 'Open' && issue.escalatedTo === null && issue.registeredAt) {
      const updateTimer = () => {
        const registeredAt = issue.registeredAt.toDate();
        const deadline = new Date(registeredAt.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from registration
        const now = new Date();
        const timeDiff = deadline - now;

        if (timeDiff <= 0) {
          setTimeLeft('Deadline passed');
          onIssueUpdated(); // Refresh issues to trigger escalation
          return;
        }

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        setTimeLeft(`${days} days ${hours} hours`);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000 * 60); // Update every minute
      return () => clearInterval(interval);
    }
  }, [issue.id, user.aadhaar, userRole, issue.status, issue.escalatedTo, issue.registeredAt, onIssueUpdated]);

  const handleVote = async (voteType) => {
    try {
      await voteIssue(issue.id, voteType, user.aadhaar);
      setHasUserVoted(true);
      onIssueUpdated();
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleSatisfactionVote = async (voteType) => {
    try {
      await voteSatisfaction(issue.id, voteType, user.aadhaar, issue.village, issue.description);
      setHasUserVotedSatisfaction(true);
      onIssueUpdated();
    } catch (err) {
      console.error('Error voting on satisfaction:', err);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveIssue(issue.id, issue.reportedBy.aadhaar, issue.description);
      onIssueUpdated();
    } catch (err) {
      console.error('Error resolving issue:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment) return;
    try {
      await addComment(issue.id, {
        user: { name: user.name, aadhaar: user.aadhaar },
        text: newComment,
      });
      setNewComment('');
      setComments(await getComments(issue.id));
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {issue.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell><strong>Reported by</strong></TableCell>
                <TableCell>{issue.reportedBy?.name} ({issue.reportedBy?.mobile})</TableCell>
              </TableRow>
              {issue.address && (
                <TableRow>
                  <TableCell><strong>Address</strong></TableCell>
                  <TableCell>{issue.address}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell>{issue.status}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Priority</strong></TableCell>
                <TableCell>{issue.priority}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Village</strong></TableCell>
                <TableCell>{issue.village}</TableCell>
              </TableRow>
              {issue.lat && issue.lng && (
                <TableRow>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell>{issue.lat}, {issue.lng}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell><strong>Urgent Votes</strong></TableCell>
                <TableCell>{issue.urgentVotes || 0}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Not Urgent Votes</strong></TableCell>
                <TableCell>{issue.notUrgentVotes || 0}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Registered At</strong></TableCell>
                <TableCell>{formatTimestamp(issue.registeredAt)}</TableCell>
              </TableRow>
              {issue.status === 'Solved' && (
                <TableRow>
                  <TableCell><strong>Solved At</strong></TableCell>
                  <TableCell>{formatTimestamp(issue.solvedAt)}</TableCell>
                </TableRow>
              )}
              {issue.status === 'Solved' && (
                <>
                  <TableRow>
                    <TableCell><strong>Satisfied Votes</strong></TableCell>
                    <TableCell>{issue.satisfiedVotes || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Unsatisfied Votes</strong></TableCell>
                    <TableCell>{issue.unsatisfiedVotes || 0}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Sarpanch Timer */}
        {userRole === 'Sarpanch' && issue.status === 'Open' && issue.escalatedTo === null && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Time Left to Resolve (Before Escalation)
            </Typography>
            <Typography variant="body2" color={timeLeft === 'Deadline passed' ? 'error' : 'text.primary'}>
              {timeLeft}
            </Typography>
          </Box>
        )}

        {/* Satisfaction Voting Buttons */}
        {userRole === 'Villager' && issue.status === 'Solved' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Are you satisfied with the resolution?
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleSatisfactionVote('satisfied')}
                disabled={hasUserVotedSatisfaction}
              >
                Satisfied
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleSatisfactionVote('unsatisfied')}
                disabled={hasUserVotedSatisfaction}
              >
                Unsatisfied
              </Button>
            </Stack>
            {hasUserVotedSatisfaction && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                You’ve already voted on satisfaction.
              </Typography>
            )}
          </Box>
        )}

        {/* Voting Buttons */}
        {userRole === 'Villager' && issue.status === 'Open' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Cast Your Vote
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleVote('urgent')}
                disabled={hasUserVoted}
              >
                Mark as Urgent
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleVote('notUrgent')}
                disabled={hasUserVoted}
              >
                Not Urgent
              </Button>
            </Stack>
            {hasUserVoted && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                You’ve already voted.
              </Typography>
            )}
          </Box>
        )}

        {/* Resolve Button */}
        {(userRole === 'Sarpanch' || userRole === 'Tehsil Officer') && issue.status === 'Open' && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleResolve}
            >
              Mark as Resolved
            </Button>
          </Box>
        )}

        {/* Comments */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Comments
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No comments yet.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {comments.map((comment) => (
                <Paper key={comment.id} sx={{ p: 1.5 }}>
                  <Comment comment={comment} />
                </Paper>
              ))}
            </Stack>
          )}
          <TextField
            label="Add a comment"
            fullWidth
            multiline
            minRows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleAddComment}
            sx={{ mt: 1 }}
            disabled={!newComment.trim()}
          >
            Add Comment
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default IssueCard;