export type File = {
    ext: string;
    mime: string;
    type: 'image' | 'video';
    thumbnail: string;
    filename: string;
    size: number;
    dimensions?: {
      height: number;
      width: number;
      orientation: number;
    };
  };
  