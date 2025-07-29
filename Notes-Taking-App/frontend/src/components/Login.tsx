import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-hot-toast';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import rightColumn from '../assets/right-column.png';
import logo from '../assets/Logo.png';

const validationSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password should be at least 8 characters')
    .required('Password is required'),
});

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { token } = await authService.login(values.email, values.password);
        login(token);
        toast.success('Login successful');
        navigate('/');
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Login failed';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    },
  });

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      console.log('Google response:', credentialResponse);
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }
      const { token } = await authService.verifyGoogleToken(
        credentialResponse.credential
      );
      login(token);
      toast.success('Google login successful');
      navigate('/');
    } catch (err: any) {
      console.error('Google login error:', err);
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'Google login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleOtpRequest = async () => {
    if (!formik.values.email) {
      const errorMessage = 'Please enter your email first';
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }
    try {
      await authService.requestOtp(formik.values.email);
      toast.success('OTP sent to your email');
      navigate('/login/otp', { state: { email: formik.values.email } });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f6fa',
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: isMobile ? '100%' : 400,
          p: isMobile ? 2 : 6,
        }}
      >

        <Paper elevation={3} sx={{ p: isMobile ? 3 : 5, width: '100%', maxWidth: 400 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <img src={logo} alt="Logo" style={{ height: 48, width: 48, borderRadius: '50%' }} />
          </Box>
          <Typography variant="h4" align="center" gutterBottom fontWeight={600}>
            Sign in
          </Typography>

          {error && (
            <Typography color="error" align="center" gutterBottom>
              {error}
            </Typography>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{ background: '#fff', borderRadius: 5, '& .MuiOutlinedInput-root': { borderRadius: 5 } }}
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              margin="normal"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{ background: '#fff', borderRadius: 5, '& .MuiOutlinedInput-root': { borderRadius: 5 } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, fontWeight: 600, fontSize: 16 }}
            >
              Sign in
            </Button>
          </form>

          <Box sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={handleOtpRequest}
              sx={{ fontWeight: 600 }}
            >
              Sign in with OTP
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>or</Divider>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                const errorMessage = 'Google login failed';
                setError(errorMessage);
                toast.error(errorMessage);
              }}
            />
          </Box>

          <Typography align="center">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>
              Sign up
            </Link>
          </Typography>
        </Paper>
      </Box>
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: `url(${rightColumn}) center/cover no-repeat`,
            minWidth: 400,
          }}
        />
      )}
    </Box>
  );
}
