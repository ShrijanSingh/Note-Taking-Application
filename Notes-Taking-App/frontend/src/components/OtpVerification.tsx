import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const validationSchema = yup.object({
  otp: yup
    .string()
    .matches(/^[0-9]{6}$/, 'Must be exactly 6 digits')
    .required('OTP is required'),
});

interface LocationState {
  email: string;
}

export function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { email } = (location.state as LocationState) || {};

  if (!email) {
    toast.error('No email provided');
    navigate('/login');
    return null;
  }

  const formik = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { token } = await authService.verifyOtp(email, values.otp);
        login(token);
        toast.success('OTP verification successful');
        navigate('/');
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'OTP verification failed';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    },
  });

  const handleResendOtp = async () => {
    try {
      await authService.requestOtp(email);
      toast.success('New OTP has been sent to your email');
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Verify OTP
          </Typography>

          <Typography align="center" gutterBottom>
            Please enter the 6-digit code sent to {email}
          </Typography>

          {error && (
            <Typography color="error" align="center" gutterBottom>
              {error}
            </Typography>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="otp"
              name="otp"
              label="OTP"
              margin="normal"
              value={formik.values.otp}
              onChange={formik.handleChange}
              error={formik.touched.otp && Boolean(formik.errors.otp)}
              helperText={formik.touched.otp && formik.errors.otp}
              inputProps={{ maxLength: 6 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
            >
              Verify OTP
            </Button>
          </form>

          <Button
            fullWidth
            color="primary"
            onClick={handleResendOtp}
            sx={{ mt: 2 }}
          >
            Resend OTP
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
