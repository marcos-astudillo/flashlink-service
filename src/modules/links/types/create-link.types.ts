export interface CreateLinkInput {
  longUrl: string;
  expiresAt?: string;
}

export interface CreateLinkResult {
  code: string;
  longUrl: string;
  shortUrl: string;
  createdAt: string;
  expiresAt: string | null;
}
