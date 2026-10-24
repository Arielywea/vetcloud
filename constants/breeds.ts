// Spanish names, roughly in the order they are seen in Chilean practice (mestizo first, by far the
// most common); the autocomplete shows matches in this order.
export const DOG_BREEDS = [
  'Mestizo', 'Poodle', 'Labrador retriever', 'Golden retriever', 'Pastor alemán', 'Bulldog francés',
  'Yorkshire terrier', 'Schnauzer miniatura', 'Chihuahua', 'Shih tzu', 'Beagle', 'Cocker spaniel inglés',
  'Dachshund (salchicha)', 'Pug', 'Border collie', 'Husky siberiano', 'Rottweiler', 'Boxer', 'Maltés',
  'Pomerania', 'Jack Russell terrier', 'Bulldog inglés', 'American pit bull terrier', 'American Staffordshire terrier',
  'Fox terrier', 'Bichón frisé', 'Lhasa apso', 'Pastor belga malinois', 'Dóberman', 'Gran danés', 'Akita',
  'Samoyedo', 'Shar pei', 'Chow chow', 'Weimaraner', 'Dálmata', 'Basset hound', 'Cavalier King Charles spaniel',
  'West Highland white terrier', 'Boyero de Berna', 'Pastor australiano', 'Corgi galés de Pembroke',
  'Pastor de Shetland', 'Collie', 'Galgo', 'Whippet', 'San Bernardo', 'Terranova', 'Cane corso',
  'Dogo argentino', 'Mastín napolitano', 'Fila brasileño', 'Bull terrier', 'Schnauzer gigante', 'Setter irlandés',
  'Braco alemán', 'Pointer', 'Alaskan malamute', 'Pekinés', 'Boston terrier', 'Shiba inu', 'Basenji',
  'Rhodesian ridgeback', 'Bloodhound', 'Staffordshire bull terrier', 'Airedale terrier',
];

export const CAT_BREEDS = [
  'Doméstico de pelo corto (mestizo)', 'Doméstico de pelo largo (mestizo)', 'Siamés', 'Persa', 'Angora turco',
  'Maine coon', 'Bengalí', 'Ragdoll', 'Británico de pelo corto', 'Azul ruso', 'Esfinge (sphynx)', 'Fold escocés',
  'Bosque de Noruega', 'Exótico de pelo corto', 'Himalayo', 'Sagrado de Birmania', 'Abisinio', 'Bombay',
  'Siberiano', 'Oriental', 'Devon rex', 'Cornish rex', 'Munchkin', 'Chartreux', 'Van turco', 'Burmés',
  'Somalí', 'Tonkinés', 'Ragamuffin', 'Habana',
];

export function filterBreeds(breeds: string[], query: string): string[] {
  if (!query.trim()) return breeds;
  const q = query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return breeds.filter(b =>
    b.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)
  ).slice(0, 8);
}
