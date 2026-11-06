import React from 'react';
import LegalPage from '../components/legal/LegalPage';
import { TERMS } from '../constants/legal';

export default function TerminosScreen() {
  return <LegalPage doc={TERMS} />;
}
