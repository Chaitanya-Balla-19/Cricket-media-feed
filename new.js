import React, { useEffect, useState, useRef, useCallback } from 'react';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';

const NewsFeed = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1); // This will hold the page number for pagination
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const apiKey = 'YOUR_NEWS_API_KEY'; // Replace with your News API key

  const fetchArticles = useCallback(async () => {
    if (loading) return; // Prevent multiple fetches
    setLoading(true);
    console.log('Fetching posts...');
    try {
      const url = `https://newsapi.org/v2/top-headlines?country=us&category=politics&pageSize=10&page=${page}&apiKey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      const newArticles = data.articles;

      setArticles((prevArticles) => [...prevArticles, ...newArticles]);
      setHasMore(newArticles.length > 0); // Check if there are more posts to load
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [page, loading]);

  useEffect(() => {
    if (hasMore) {
      fetchArticles();
    }
  }, [fetchArticles, hasMore]);

  const lastArticleElementRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          console.log('Last element in view, loading more...');
          setPage((prevPage) => prevPage + 1); // This triggers fetching the next set of posts
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div className="news-feed">
      {articles.map((article, index) => {
        if (articles.length === index + 1) {
          return (
            <div ref={lastArticleElementRef} key={index}>
              <ArticleCard
                title={article.title}
                description={article.description}
              />
            </div>
          );
        } else {
          return (
            <ArticleCard
              key={index}
              title={article.title}
              description={article.description}
            />
          );
        }
      })}
      {loading && <LoadingSpinner />}
      {!hasMore && <div>No more posts to load.</div>}
    </div>
  );
};

export default NewsFeed;
