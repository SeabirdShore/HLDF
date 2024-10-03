import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Table, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';

const QueryEvidenceHistory = () => {
  const [evidenceID, setEvidenceID] = useState('');
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');

  const handleQueryHistory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:9099/queryEvidenceHistory/${evidenceID}`);
      if (response.status === 200) {
        const responseData = response.data;
        if (responseData.code === "200") {
          const parsedResult = JSON.parse(responseData.result);
          setHistory(parsedResult);
          setError('');
        } else {
          setError(responseData.message || 'Unexpected response code');
          setHistory(null);
        }
      } else {
        setError('Unexpected response status');
        setHistory(null);
      }
    } catch (error) {
      console.error('Error fetching evidence history:', error);
      setHistory(null);
      setError('Error fetching evidence history');
    }
  };

  return (
    <Container>
      <Row className="my-4">
        <Col md={12}>
          <h2 className="text-center">Query Evidence History</h2>
          <Form onSubmit={handleQueryHistory}>
            <Form.Group controlId="formEvidenceID">
                <Form.Label>Evidence ID</Form.Label>
                <Row className="justify-content-center"> {/* 使用justify-content-center进行居中 */}
                    <Col md={8}> 
                    <Form.Control
                        type="text"
                        value={evidenceID}
                        onChange={(e) => setEvidenceID(e.target.value)}
                        required
                    />
                    </Col>
                </Row>
            </Form.Group>

            <Button variant="primary" type="submit">Query</Button>
          </Form>
          {history && (
            <div className="mt-3">
              <h3>Evidence History:</h3>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Timestamp</th>
                    <th>Collector</th>
                    <th>MD5 Hash</th>
                    <th>SHA1 Hash</th>
                    <th>SHA256 Hash</th>
                    <th>SHA512 Hash</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.version}</td>
                      <td>{entry.timestamp}</td>
                      <td>{entry.collector}</td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{entry.md5Hash}</Tooltip>}
                        >
                          <span className="text-truncate" style={{ maxWidth: '150px', display: 'inline-block' }}>
                            {entry.md5Hash}
                          </span>
                        </OverlayTrigger>
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{entry.sha1Hash}</Tooltip>}
                        >
                          <span className="text-truncate" style={{ maxWidth: '150px', display: 'inline-block' }}>
                            {entry.sha1Hash}
                          </span>
                        </OverlayTrigger>
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{entry.sha256Hash}</Tooltip>}
                        >
                          <span className="text-truncate" style={{ maxWidth: '150px', display: 'inline-block' }}>
                            {entry.sha256Hash}
                          </span>
                        </OverlayTrigger>
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{entry.sha512Hash}</Tooltip>}
                        >
                          <span className="text-truncate" style={{ maxWidth: '150px', display: 'inline-block' }}>
                            {entry.sha512Hash}
                          </span>
                        </OverlayTrigger>
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{entry.description}</Tooltip>}
                        >
                          <span className="text-truncate" style={{ maxWidth: '200px', display: 'inline-block' }}>
                            {entry.description}
                          </span>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Col>
      </Row>
    </Container>
  );
};

export default QueryEvidenceHistory;
