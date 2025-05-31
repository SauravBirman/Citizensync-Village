import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Box, Avatar, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HomeIcon from '@mui/icons-material/Home';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ListAltIcon from '@mui/icons-material/ListAlt';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);

  const handleIssuesClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(135deg, #1a3c34, #2e7d32)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      py: 1
    }}>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        maxWidth: 'xl',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Left Side - Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            CitizenSync Village
          </Typography>
          <IconButton
            color="inherit"
            aria-label="open menu"
            edge="start"
            onClick={handleMobileMenuOpen}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Desktop Navigation */}
        {user.aadhaar && (
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/')}
              startIcon={<HomeIcon />}
              sx={{ 
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                borderRadius: '8px'
              }}
            >
              Home
            </Button>
            
            <Button 
              color="inherit" 
              onClick={() => navigate('/report')}
              startIcon={<ReportProblemIcon />}
              sx={{ 
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                borderRadius: '8px'
              }}
            >
              Report
            </Button>
            
            <Button 
              color="inherit" 
              onClick={handleIssuesClick}
              startIcon={<ListAltIcon />}
              sx={{ 
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                borderRadius: '8px'
              }}
            >
              Issues
            </Button>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  borderRadius: '8px'
                }
              }}
            >
              <MenuItem 
                onClick={() => { navigate('/issues/current'); handleMenuClose(); }}
                sx={{ py: 1.5 }}
              >
                Current Issues
              </MenuItem>
              <MenuItem 
                onClick={() => { navigate('/issues/solved'); handleMenuClose(); }}
                sx={{ py: 1.5 }}
              >
                Solved Issues
              </MenuItem>
            </Menu>
            
            <Button 
              color="inherit" 
              onClick={() => navigate('/announcements')}
              startIcon={<AnnouncementIcon />}
              sx={{ 
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                borderRadius: '8px'
              }}
            >
              Announcements
            </Button>
            
            <Button 
              color="inherit" 
              onClick={() => navigate('/notifications')}
              startIcon={<NotificationsIcon />}
              sx={{ 
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                borderRadius: '8px'
              }}
            >
              Notifications
            </Button>
            
            <Button 
              color="inherit" 
              onClick={() => navigate('/dashboard')}
              startIcon={<DashboardIcon />}
              sx={{ 
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                borderRadius: '8px'
              }}
            >
              Dashboard
            </Button>
            
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<ExitToAppIcon />}
              sx={{ 
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                borderRadius: '8px',
                ml: 1
              }}
            >
              Logout
            </Button>
          </Box>
        )}

        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileAnchorEl}
          open={Boolean(mobileAnchorEl)}
          onClose={handleMobileMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              borderRadius: '8px'
            }
          }}
        >
          {user.aadhaar && (
            <>
              <MenuItem onClick={() => { navigate('/'); handleMobileMenuClose(); }}>
                <HomeIcon sx={{ mr: 1.5 }} /> Home
              </MenuItem>
              <MenuItem onClick={() => { navigate('/report'); handleMobileMenuClose(); }}>
                <ReportProblemIcon sx={{ mr: 1.5 }} /> Report Issue
              </MenuItem>
              <MenuItem onClick={() => { navigate('/issues/current'); handleMobileMenuClose(); }}>
                <ListAltIcon sx={{ mr: 1.5 }} /> Current Issues
              </MenuItem>
              <MenuItem onClick={() => { navigate('/issues/solved'); handleMobileMenuClose(); }}>
                <ListAltIcon sx={{ mr: 1.5 }} /> Solved Issues
              </MenuItem>
              <MenuItem onClick={() => { navigate('/announcements'); handleMobileMenuClose(); }}>
                <AnnouncementIcon sx={{ mr: 1.5 }} /> Announcements
              </MenuItem>
              <MenuItem onClick={() => { navigate('/notifications'); handleMobileMenuClose(); }}>
                <NotificationsIcon sx={{ mr: 1.5 }} /> Notifications
              </MenuItem>
              <MenuItem onClick={() => { navigate('/dashboard'); handleMobileMenuClose(); }}>
                <DashboardIcon sx={{ mr: 1.5 }} /> Dashboard
              </MenuItem>
              <MenuItem onClick={() => { handleLogout(); handleMobileMenuClose(); }}>
                <ExitToAppIcon sx={{ mr: 1.5 }} /> Logout
              </MenuItem>
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;