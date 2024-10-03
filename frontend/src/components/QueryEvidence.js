import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';

const QueryEvidence = () => {
  const [evidenceID, setEvidenceID] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleQuery = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      const response = await axios.get(`http://localhost:9099/queryEvidence/${evidenceID}`);
      console.log('API Response:', response); // Debug: Log the entire response
      if (response.status === 200) {
        const responseData = response.data;
        if (responseData.code === "200") {
          // Parse the result field
          const parsedResult = JSON.parse(responseData.result);
          setResult(parsedResult);
          setError('');
        } else {
          setError(responseData.message || 'Unexpected response code');
          setResult(null);
        }
      } else {
        setError('Unexpected response status');
        setResult(null);
      }
    } catch (error) {
      console.error('Error fetching evidence:', error); // Debug: Log the error
      setResult(null);
      setError('Error fetching evidence');
    }
  };

  return (
    <Container>
      <Row className="my-4">
        <Col md={8} className="mx-auto">
          <h2 className="text-center">Query Evidence</h2>
          <Form onSubmit={handleQuery}>
            <Form.Group controlId="formEvidenceID">
              <Form.Label>Evidence ID</Form.Label>
              <Form.Control
                type="text"
                value={evidenceID}
                onChange={(e) => setEvidenceID(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">Query</Button>
          </Form>
          {result && (
            <div className="mt-3">
              <h3>Result:</h3>
              <pre>{JSON.stringify(result, null, 2)}</pre> {/* Pretty print the result */}
            </div>
          )}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Col>
      </Row>
    </Container>
  );
};

export default QueryEvidence;
