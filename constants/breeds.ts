export const DOG_BREEDS = [
  'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'French Bulldog', 'Bulldog',
  'Poodle', 'Beagle', 'Rottweiler', 'Dachshund', 'German Shorthaired Pointer',
  'Pembroke Welsh Corgi', 'Australian Shepherd', 'Yorkshire Terrier', 'Boxer', 'Cavalier King Charles Spaniel',
  'Miniature Schnauzer', 'Doberman Pinscher', 'Miniature American Shepherd', 'Great Dane', 'Pomeranian',
  'Havanese', 'Shih Tzu', 'Boston Terrier', 'Bernese Mountain Dog', 'Shetland Sheepdog',
  'Collie', 'Brittany', 'English Springer Spaniel', 'Cocker Spaniel', 'Vizsla',
  'West Highland White Terrier', 'Maltese', 'Chihuahua', 'Pug', 'Rhodesian Ridgeback',
  'Basset Hound', 'Bloodhound', 'Weimaraner', 'Newfoundland', 'Saint Bernard',
  'Staffordshire Bull Terrier', 'Airedale Terrier', 'Akita', 'Alaskan Malamute', 'Border Collie',
  'Chow Chow', 'Dalmatian', 'Irish Setter', 'Lhasa Apso', 'Pekingese',
  'Samoyed', 'Siberian Husky', 'Whippet', 'Afghan Hound', 'Basenji',
  'Bull Terrier', 'Chinese Shar-Pei', 'Cocker Spaniel Americano', 'Fox Terrier', 'Jack Russell Terrier',
  'Mastiff', 'Pit Bull', 'Schnauzer Gigante', 'Terranova', 'Pastor Belga',
  'Braco Aleman', 'Pointer Ingles', 'Galgo', 'Bodeguero Andaluz', 'Mastin Español',
];

export const CAT_BREEDS = [
  'Persian', 'Maine Coon', 'Ragdoll', 'British Shorthair', 'Bengal',
  'Abyssinian', 'Siamese', 'Birman', 'Bombay', 'American Shorthair',
  'Scottish Fold', 'Russian Blue', 'Sphynx', 'Norwegian Forest Cat', 'Exotic Shorthair',
  'Ragamuffin', 'Tonkinese', 'Burman', 'Somali', 'Havana Brown',
  'Chartreux', 'Korat', 'LaPerm', 'Oriental', 'Siberian',
  'Singapura', 'Snowshoe', 'Turkish Angora', 'Turkish Van', 'Munchkin',
  'Devon Rex', 'Cornish Rex', 'Abyssinian', 'Balinese', 'Javanese',
  'Manx', 'Selkirk Rex', 'Singapura', 'Burmilla', 'Chinchilla',
];

export function filterBreeds(breeds: string[], query: string): string[] {
  if (!query.trim()) return breeds;
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return breeds.filter(b =>
    b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
  ).slice(0, 8);
}
