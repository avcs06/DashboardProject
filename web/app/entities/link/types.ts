export type Link = {
  id: string;
  createdAt: string;
  updatedAt: string;
  linkTitle: string;
  webAddress: string;
  widget: string;
  position: number;
};

/** What a create takes: everything but the fields the store sets. */
export type LinkInput = Omit<Link, 'id' | 'createdAt' | 'updatedAt'>;
