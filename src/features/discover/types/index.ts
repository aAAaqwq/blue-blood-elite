export interface InterestGroup {
  id: string;
  name: string;
  icon: string;
  memberCount: number;
  description: string;
}

export interface UserMatch {
  id: string;
  name: string;
  avatar: string;
  matchScore: number;
  field: string;
  skills: string[];
}

export interface SearchResult {
  id: string;
  type: 'user' | 'task' | 'course';
  title: string;
  description: string;
}

export interface DiscoverFilters {
  category?: string;
  search?: string;
}
