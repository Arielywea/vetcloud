export const VACCINATION_PROTOCOLS = {
  dog: [
    {
      name: 'DHPPi (Moquillo, Hepatitis, Parvovirus, Parainfluenza, Adenovirus)',
      schedule: [
        { age: '6-8 semanas', dose: 1 },
        { age: '10-12 semanas', dose: 2 },
        { age: '14-16 semanas', dose: 3 },
        { age: '12-16 meses', dose: 'Refuerzo' },
        { age: 'Cada 1-3 años', dose: 'Refuerzo anual' },
      ],
    },
    {
      name: 'Leptospirosis',
      schedule: [
        { age: '12 semanas', dose: 1 },
        { age: '16 semanas', dose: 2 },
        { age: 'Anual', dose: 'Refuerzo' },
      ],
    },
    {
      name: 'Rabia',
      schedule: [
        { age: '12-16 semanas', dose: 1 },
        { age: '12-16 meses', dose: 'Refuerzo' },
        { age: 'Anual o trienal', dose: 'Refuerzo según legislación' },
      ],
    },
    {
      name: 'Bordetella (Tos de las perreras)',
      schedule: [
        { age: '8 semanas+', dose: '1 (si riesgo)' },
        { age: 'Anual o semestral', dose: 'Refuerzo si necesidad' },
      ],
    },
  ],
  cat: [
    {
      name: 'FVRCP (Rinotraqueítis, Calicivirus, Panleucopenia)',
      schedule: [
        { age: '8-9 semanas', dose: 1 },
        { age: '12 semanas', dose: 2 },
        { age: '16 semanas', dose: 3 },
        { age: '12-16 meses', dose: 'Refuerzo' },
        { age: 'Cada 3 años', dose: 'Refuerzo' },
      ],
    },
    {
      name: 'FeLV (Leucemia Felina)',
      schedule: [
        { age: '8-9 semanas', dose: 1 },
        { age: '12 semanas', dose: '2 (refuerzo)' },
        { age: 'Anual', dose: 'Refuerzo si riesgo' },
      ],
    },
    {
      name: 'Rabia',
      schedule: [
        { age: '12-16 semanas', dose: 1 },
        { age: '12-16 meses', dose: 'Refuerzo' },
        { age: 'Anual o trienal', dose: 'Refuerzo según legislación' },
      ],
    },
  ],
};
