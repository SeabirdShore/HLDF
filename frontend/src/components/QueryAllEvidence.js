import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Table, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';

const QueryAllEvidence = () => {
  const [allEvidence, setAllEvidence] = useState(null);
  const [error, setError] = useState('');

  const handleQueryAll = async () => {
    try {
      const response = await axios.get('http://localhost:9099/queryAllEvidence');
      if (response.status === 200) {
        const responseData = response.data;
        if (responseData.code === "200") {
          const parsedResult = JSON.parse(responseData.result);
          setAllEvidence(parsedResult);
          setError('');
        } else {
          setError(responseData.message || 'Unexpected response code');
          setAllEvidence(null);
        }
      } else {
        setError('Unexpected response status');
        setAllEvidence(null);
      }
    } catch (error) {
      console.error('Error fetching all evidence:', error);
      setAllEvidence(null);
      setError('Error fetching all evidence');
    }
  };

  return (
    <Container>
      <Row className="my-4">
        <Col md={12}>
          <h2 className="text-center">Query All Evidence</h2>
          <Button variant="primary" onClick={handleQueryAll}>Query</Button>
          {allEvidence && (
            <div className="mt-3">
              <h3>All Evidence:</h3>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Evidence ID</th>
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
                  {allEvidence.map((evidence, index) => (
                    <tr key={index}>
                      <td>{evidence.evidenceID}</td>
                      <td>{evidence.version}</td>
                      <td>{evidence.timestamp}</td>
                      <td>{evidence.collector}</td>
                      {/* For hash values, limit width and add tooltip for long text */}
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{evidence.md5Hash}</Tooltip>}
                        >
                          <span className="text-truncate" style={{ maxWidth: '150px', display: 'inline-block' }}>
                            {evidence.md5Hash}
                          </span>
                        </OverlayTrigger>
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{evidence.sha1Hash}</Tooltip>}
                        >
                          <span className="text-truncate" style={{ maxWidth: '150px', display: 'inline-block' }}>
                            {evidence.sha1Hash}
                          </span>
                        </OverlayTrigger>
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{evidence.sha256Hash}</Tooltip>}
                        >
                          <span className="text-truncate" style={{ maxWidth: '150px', display: 'inline-block' }}>
                            {evidence.sha256Hash}
                          </span>
                        </OverlayTrigger>
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{evidence.sha512Hash}</Tooltip>}
                        >
                          <span className="text-truncate" style={{ maxWidth: '150px', display: 'inline-block' }}>
                            {evidence.sha512Hash}
                          </span>
                        </OverlayTrigger>
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{evidence.description}</Tooltip>}
                        >
                          <span className="text-truncate" style={{ maxWidth: '200px', display: 'inline-block' }}>
                            {evidence.description}
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

export default QueryAllEvidence;
