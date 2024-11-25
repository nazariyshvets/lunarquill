export interface Avatar {
  id: string;
  name: string;
  dataUrl: string;
  // only new avatars have this property
  src?: File;
}
