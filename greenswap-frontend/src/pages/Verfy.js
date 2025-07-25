import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

const Verfy = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/verf/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
         body: JSON.stringify({ token: token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setSuccess(data.message || 'Verification successful!');
      setTimeout(() => navigate('/'), 3000); // Redirect after 3 seconds
    } catch (err) {
      setError(err.message || 'An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="w-100" style={{ maxWidth: '500px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">Account Verification</Card.Title>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Verification Token</Form.Label>
              <Form.Control
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your verification token"
                required
              />
              <Form.Text className="text-muted">
                Check your email for the verification token
              </Form.Text>
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Verifying...
                  </>
                ) : (
                  'Verify Account'
                )}
              </Button>
            </div>
          </Form>

          {/* <div className="text-center mt-3">
            <p>
              Didn't receive a token?{' '}
              <Button variant="link" onClick={() => navigate('/resend-verification')}>
                Resend verification
              </Button>
            </p>
          </div> */}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Verfy;