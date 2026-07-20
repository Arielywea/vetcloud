export function calculateAge(birthDate: string): string {
  if (!birthDate) return 'N/D';
  try {
    let birth: Date;
    if (birthDate.includes('-')) {
      birth = new Date(birthDate);
    } else if (birthDate.includes('/')) {
      const parts = birthDate.split('/');
      if (parts.length !== 3) return 'N/D';
      birth = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      return 'N/D';
    }
    if (isNaN(birth.getTime())) return 'N/D';

    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }
    if (now.getDate() < birth.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }

    if (years < 0) return 'N/D';
    if (years === 0 && months === 0) return 'Recién nacido';
    if (years === 0) return `${months} mes${months !== 1 ? 'es' : ''}`;
    if (months === 0) return `${years} año${years !== 1 ? 's' : ''}`;
    return `${years} año${years !== 1 ? 's' : ''}, ${months} mes${months !== 1 ? 'es' : ''}`;
  } catch {
    return 'N/D';
  }
}
