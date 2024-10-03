import React from 'react';
import SaveEvidence from './components/SaveEvidence';
import QueryEvidence from './components/QueryEvidence';
import QueryAllEvidence from './components/QueryAllEvidence';
import QueryEvidenceHistory from './components/QueryEvidenceHistory';
import { Container } from 'react-bootstrap';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="jumbotron text-center bg-light py-5 mb-4">
        <Container>
          <h1>Digital Forensics Hyperledger</h1>
          <img src="./assets/logo.png" alt="Digital Evidence" className="img-fluid" width={500} />
        </Container>
      </div>
    
      <Container>
        <SaveEvidence/>
        <hr />
        <QueryEvidence />
        <hr/>
        <QueryEvidenceHistory/>
        <hr/>
        <QueryAllEvidence/>
      </Container>
    </div>
  );
}

export default App;
