export type GalleryCategory = 'comida' | 'amigos';

export interface GalleryPhoto {
  src: string;
  alt: string;
  category: GalleryCategory;
}

export const galleryPhotos: GalleryPhoto[] = [
  { src: '/gallery/picture1.jpeg', alt: 'Del Antonio', category: 'comida' },
  { src: '/gallery/picture2.jpeg', alt: 'Del Antonio', category: 'comida' },
  { src: '/gallery/picture3.jpeg', alt: 'Del Antonio', category: 'amigos' },
  { src: '/gallery/picture4.jpeg', alt: 'Del Antonio', category: 'amigos' },
];
