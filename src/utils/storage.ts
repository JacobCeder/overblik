import { NewsOverview, Article } from '@/types';
import { supabase, DatabaseOverview, DatabaseArticle } from '@/lib/supabase';

// Convert database overview to app format
function convertDatabaseOverview(
  dbOverview: DatabaseOverview, 
  dbArticles: DatabaseArticle[]
): NewsOverview {
  const articles: Article[] = dbArticles
    .sort((a, b) => a.order_index - b.order_index)
    .map(article => ({
      id: article.id,
      heading: article.heading,
      subheading: article.subheading,
      mediaName: article.media_name || undefined,
      mediaUrl: article.media_url || undefined,
      author: article.author,
      body: article.body,
      date: new Date(article.date),
      order: article.order_index,
    }));

  return {
    id: dbOverview.id,
    title: dbOverview.title,
    description: dbOverview.description || undefined,
    articles,
    createdAt: new Date(dbOverview.created_at),
    updatedAt: new Date(dbOverview.updated_at),
  };
}

export const saveOverview = async (overview: NewsOverview): Promise<void> => {
  try {
    // First, upsert the overview
    const { error: overviewError } = await supabase
      .from('overviews')
      .upsert({
        id: overview.id,
        title: overview.title,
        description: overview.description || null,
      });

    if (overviewError) {
      throw overviewError;
    }

    // Delete existing articles for this overview
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('overview_id', overview.id);

    if (deleteError) {
      throw deleteError;
    }

    // Insert new articles
    if (overview.articles.length > 0) {
      const articlesToInsert = overview.articles.map((article, index) => ({
        id: article.id,
        overview_id: overview.id,
        heading: article.heading,
        subheading: article.subheading,
        media_name: article.mediaName || null,
        media_url: article.mediaUrl || null,
        author: article.author,
        body: article.body,
        date: article.date.toISOString(),
        order_index: index,
      }));

      const { error: articlesError } = await supabase
        .from('articles')
        .insert(articlesToInsert);

      if (articlesError) {
        throw articlesError;
      }
    }
  } catch (error) {
    console.error('Failed to save overview:', error);
    throw new Error('Failed to save overview to database');
  }
};

export const getStoredOverviews = async (): Promise<NewsOverview[]> => {
  try {
    // Get all overviews
    const { data: overviews, error: overviewsError } = await supabase
      .from('overviews')
      .select('*')
      .order('updated_at', { ascending: false });

    if (overviewsError) {
      throw overviewsError;
    }

    if (!overviews || overviews.length === 0) {
      return [];
    }

    // Get all articles for these overviews
    const overviewIds = overviews.map(o => o.id);
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .in('overview_id', overviewIds)
      .order('order_index');

    if (articlesError) {
      throw articlesError;
    }

    // Group articles by overview_id
    const articlesByOverview = (articles || []).reduce((acc, article) => {
      if (!acc[article.overview_id]) {
        acc[article.overview_id] = [];
      }
      acc[article.overview_id].push(article);
      return acc;
    }, {} as Record<string, DatabaseArticle[]>);

    // Convert to app format
    return overviews.map(overview => 
      convertDatabaseOverview(overview, articlesByOverview[overview.id] || [])
    );
  } catch (error) {
    console.error('Failed to load overviews:', error);
    throw new Error('Failed to load overviews from database');
  }
};

export const getOverviewById = async (overviewId: string): Promise<NewsOverview | null> => {
  try {
    // Get the overview
    const { data: overview, error: overviewError } = await supabase
      .from('overviews')
      .select('*')
      .eq('id', overviewId)
      .single();

    if (overviewError) {
      if (overviewError.code === 'PGRST116') {
        return null; // Not found
      }
      throw overviewError;
    }

    // Get articles for this overview
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .eq('overview_id', overviewId)
      .order('order_index');

    if (articlesError) {
      throw articlesError;
    }

    return convertDatabaseOverview(overview, articles || []);
  } catch (error) {
    console.error('Failed to load overview:', error);
    throw new Error('Failed to load overview from database');
  }
};

export const deleteStoredOverview = async (overviewId: string): Promise<void> => {
  try {
    // Delete the overview (articles will be deleted automatically due to CASCADE)
    const { error } = await supabase
      .from('overviews')
      .delete()
      .eq('id', overviewId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete overview:', error);
    throw new Error('Failed to delete overview from database');
  }
};

// New functions for individual article operations
export const saveArticle = async (overviewId: string, article: Article): Promise<void> => {
  try {
    const { error } = await supabase
      .from('articles')
      .upsert({
        id: article.id,
        overview_id: overviewId,
        heading: article.heading,
        subheading: article.subheading,
        media_name: article.mediaName || null,
        media_url: article.mediaUrl || null,
        author: article.author,
        body: article.body,
        date: article.date.toISOString(),
        order_index: article.order,
      });

    if (error) {
      throw error;
    }

    // Update the overview's updated_at timestamp
    await supabase
      .from('overviews')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', overviewId);
  } catch (error) {
    console.error('Failed to save article:', error);
    throw new Error('Failed to save article to database');
  }
};

export const deleteArticle = async (articleId: string, overviewId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) {
      throw error;
    }

    // Update the overview's updated_at timestamp
    await supabase
      .from('overviews')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', overviewId);
  } catch (error) {
    console.error('Failed to delete article:', error);
    throw new Error('Failed to delete article from database');
  }
};

export const reorderArticles = async (overviewId: string, articles: Article[]): Promise<void> => {
  try {
    // Update each article's order_index individually
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const { error } = await supabase
        .from('articles')
        .update({ order_index: i })
        .eq('id', article.id);

      if (error) {
        console.error(`Failed to update article ${article.id} order:`, error);
        throw error;
      }
    }

    // Update the overview's updated_at timestamp
    const { error: overviewError } = await supabase
      .from('overviews')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', overviewId);

    if (overviewError) {
      console.error('Failed to update overview timestamp:', overviewError);
      throw overviewError;
    }
  } catch (error) {
    console.error('Failed to reorder articles:', error);
    // Preserve the original error details
    throw new Error(`Failed to reorder articles in database: ${error.message || JSON.stringify(error)}`);
  }
};

export const exportOverviewAsJson = (overview: NewsOverview): void => {
  try {
    const dataStr = JSON.stringify(overview, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${overview.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  } catch (error) {
    console.error('Failed to export overview:', error);
  }
};

export const importOverviewFromJson = (file: File): Promise<NewsOverview> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const overview: NewsOverview = {
          ...(json as NewsOverview & { createdAt: string; updatedAt: string; articles: Array<{ date: string }> }),
          createdAt: new Date(json.createdAt),
          updatedAt: new Date(json.updatedAt),
          articles: json.articles.map((article: { date: string }) => ({
            ...article,
            date: new Date(article.date)
          }))
        };
        resolve(overview);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};