import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  address: string;
  username?: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Story {
  _id: ObjectId;
  title: string;
  content: string;
  summary: string;
  author: ObjectId;
  genre: string;
  coverImage?: string;
  tokenId?: string;
  price?: number;
  likes: number;
  views: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id: ObjectId;
  storyId: ObjectId;
  author: ObjectId;
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Genre {
  _id: ObjectId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NFT {
  _id: ObjectId;
  storyId: ObjectId;
  tokenId: string;
  contractAddress: string;
  owner: string;
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
