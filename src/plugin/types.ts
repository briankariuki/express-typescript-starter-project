import { Model, Document } from 'mongoose';

export interface PageResult<T> {
  docs: T[];
  total: number;
  limit: number;
  page: number;
  pages: number;
  sort: string;
}

export interface Populate {
  path: string;
  select?: string;
  populate?: Populate[];
}

export interface PageOptions {
  q?: string;
  sort?: string;
  select?: string;
  limit?: number;
  page?: number;
  key?: string;
  direction?: 'next' | 'previous';
  populate?: Populate[];
}

export interface PagedModel<T extends Document> extends Model<T> {
  page(query: any, options: PageOptions): Promise<PageResult<T>>;
}

export interface SearchableModel<T extends Document> extends Model<T> {
  look(
    q: string,
    options?: { query?: Query; fields?: any; populate?: Populate[]; page?: number; limit?: number },
  ): Promise<T[]>;
  search(query: any, options: any, callback: any): Promise<T[]>;
  createMapping(settings: any, callback: any): any;
  bulkError(): any;
  synchronize(): any;
  esTruncate(callback: any): any;
}

export type Query = Record<string, any> & {
  q?: string;
};

export type _Status = 'active' | 'blocked' | 'deleted';

export interface DefaultDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
  _status: _Status;
}

export interface QueryParams {
  sort: string;
  page: number;
  limit: number;
  q: string;
  key: string;
  direction: 'next' | 'previous';
  _status: string;
}
