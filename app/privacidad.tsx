import React from 'react';
import LegalPage from '../components/legal/LegalPage';
import { PRIVACY } from '../constants/legal';

export default function PrivacidadScreen() {
  return <LegalPage doc={PRIVACY} />;
}
