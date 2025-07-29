export interface Article {
  id: string;
  heading: string;
  subheading: string;
  mediaName?: string;
  mediaUrl?: string;
  author: string;
  body: string;
  date: Date;
  order: number;
}

export interface NewsOverview {
  id: string;
  title: string;
  description?: string;
  articles: Article[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OverviewState {
  currentOverview: NewsOverview | null;
  selectedArticleId: string | null;
  isLoading: boolean;
  error: string | null;
}