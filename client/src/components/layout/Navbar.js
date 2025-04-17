import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Menu, MenuItem, Avatar, Divider, ListItemIcon, Tooltip, Switch, useMediaQuery, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Menu as MenuIcon, Dashboard, Person, Assignment, Logout, DarkMode, LightMode, AdminPanelSettings } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };
  
  const menuId = 'primary-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      id={menuId}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 3,
        sx: { minWidth: 180 }
      }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle1" noWrap>
          {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="body2" color="textSecondary" noWrap>
          {user?.username}
        </Typography>
      </Box>
      
      <Divider />
      
      <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }}>
        <ListItemIcon>
          <Dashboard fontSize="small" />
        </ListItemIcon>
        Dashboard
      </MenuItem>
      
      <MenuItem onClick={() => { handleMenuClose(); navigate('/my-exams'); }}>
        <ListItemIcon>
          <Assignment fontSize="small" />
        </ListItemIcon>
        My Exams
      </MenuItem>
      
      {user?.role === 'admin' && (
        <MenuItem onClick={() => { handleMenuClose(); navigate('/admin/dashboard'); }}>
          <ListItemIcon>
            <AdminPanelSettings fontSize="small" />
          </ListItemIcon>
          Admin Panel
        </MenuItem>
      )}
      
      <Divider />
      
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2">Dark Mode</Typography>
        <Switch
          checked={darkMode}
          onChange={toggleDarkMode}
          color="primary"
          size="small"
          edge="end"
        />
      </Box>
      
      <Divider />
      
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );
  
  const drawer = (
    <div>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CEFR Speaking
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/" onClick={handleDrawerToggle}>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        
        {isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/dashboard" onClick={handleDrawerToggle}>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/my-exams" onClick={handleDrawerToggle}>
                <ListItemText primary="My Exams" />
              </ListItemButton>
            </ListItem>
            
            {user?.role === 'admin' && (
              <ListItem disablePadding>
                <ListItemButton component={RouterLink} to="/admin/dashboard" onClick={handleDrawerToggle}>
                  <ListItemText primary="Admin Panel" />
                </ListItemButton>
              </ListItem>
            )}
            
            <Divider sx={{ my: 1 }} />
            
            <ListItem>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <Typography variant="body2">Dark Mode</Typography>
                <Switch
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  color="primary"
                  size="small"
                  edge="end"
                />
              </Box>
            </ListItem>
            
            <Divider sx={{ my: 1 }} />
            
            <ListItem disablePadding>
              <ListItemButton onClick={() => { handleDrawerToggle(); handleLogout(); }}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/login" onClick={handleDrawerToggle}>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/register" onClick={handleDrawerToggle}>
                <ListItemText primary="Register" />
              </ListItemButton>
            </ListItem>
            
            <Divider sx={{ my: 1 }} />
            
            <ListItem>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <Typography variant="body2">Dark Mode</Typography>
                <Switch
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  color="primary"
                  size="small"
                  edge="end"
                />
              </Box>
            </ListItem>
          </>
        )}
      </List>
    </div>
  );
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/"
              sx={{ textTransform: 'none', fontSize: '1.25rem', fontWeight: 'bold' }}
            >
              CEFR Speaking
            </Button>
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button color="inherit" component={RouterLink} to="/">
                Home
              </Button>
              
              {isAuthenticated ? (
                <>
                  <Button color="inherit" component={RouterLink} to="/dashboard">
                    Dashboard
                  </Button>
                  
                  <Button color="inherit" component={RouterLink} to="/my-exams">
                    My Exams
                  </Button>
                  
                  <Tooltip title="Account settings">
                    <IconButton
                      edge="end"
                      aria-label="account"
                      aria-controls={menuId}
                      aria-haspopup="true"
                      onClick={handleProfileMenuOpen}
                      color="inherit"
                      sx={{ ml: 1 }}
                    >
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                        {user?.firstName?.charAt(0) || 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Button color="inherit" component={RouterLink} to="/login">
                    Login
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    component={RouterLink} 
                    to="/register"
                    sx={{ ml: 1 }}
                  >
                    Register
                  </Button>
                  
                  <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                    <IconButton color="inherit" onClick={toggleDarkMode} sx={{ ml: 1 }}>
                      {darkMode ? <LightMode /> : <DarkMode />}
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
      
      {renderMenu}
    </Box>
  );
};

export default Navbar;