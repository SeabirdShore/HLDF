import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [evidenceID, setEvidenceID] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [collector, setCollector] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('evidenceID', evidenceID);
    formData.append('timestamp', timestamp);
    formData.append('collector', collector);
    formData.append('description', description);

    try {
      const response = await axios.post('http://localhost:9099/saveEvidence', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(response.data.message);
      setError('');
    } catch (error) {
      setMessage('');
      setError('Error uploading evidence');
    }
  };

  return (
    <Container>
      <Row className="my-4">
        <Col md={8} className="mx-auto">
          <h2 className="text-center">Upload Digital Evidence</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formFile">
              <Form.Label>File</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} required />
            </Form.Group>
            <Form.Group controlId="formEvidenceID">
              <Form.Label>Evidence ID</Form.Label>
              <Form.Control type="text" value={evidenceID} onChange={(e) => setEvidenceID(e.target.value)} required />
            </Form.Group>
            <Form.Group controlId="formTimestamp">
              <Form.Label>Timestamp</Form.Label>
              <Form.Control type="text" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} required />
            </Form.Group>
            <Form.Group controlId="formCollector">
              <Form.Label>Collector</Form.Label>
              <Form.Control type="text" value={collector} onChange={(e) => setCollector(e.target.value)} required />
            </Form.Group>
            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </Form.Group>
            <Button variant="primary" type="submit">Submit</Button>
          </Form>
          {message && <Alert variant="success" className="mt-3">{message}</Alert>}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Col>
      </Row>
    </Container>
  );
};

export default FileUpload;
