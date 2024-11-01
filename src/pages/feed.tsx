import { useEffect, useState, useCallback } from "react";
import { useInView } from 'react-intersection-observer';
import { useRouter } from "next/router";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import dynamic from 'next/dynamic';

interface IPost {
    _id: string;
    user_id: string;
    content: string;
    username: string;
    image_url: string;
    likes_count: number;
    comments_count: number;
}

interface FeedResponse {
    posts: IPost[];
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

const Post = dynamic(() => import('../components/Post'), {
    ssr: false,
    loading: () => (
        <div className="bg-slate-800 rounded-lg p-4 shadow animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
    )
});

const Feed = () => {
    const [posts, setPosts] = useState<IPost[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const router = useRouter();
    const { ref, inView } = useInView();
    const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();

    // Single authentication check
    useEffect(() => {
        const checkAuth = async () => {
            if (!authLoading && (!isAuthenticated || !token)) {
                console.log('Redirecting to login - Not authenticated');
                router.push('/login');
            }
        };

        checkAuth();
    }, [isAuthenticated, token, authLoading, router]);

    const fetchPosts = useCallback(async (pageNum: number) => {
        if (!token) return; // Don't fetch if no token

        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/feed?page=${pageNum}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    router.push('/login');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: FeedResponse = await response.json();
            if (pageNum === 1) {
                setPosts(data.posts);
            } else {
                setPosts(prev => [...prev, ...data.posts]);
            }

            setHasMore(data.hasMore);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            console.error("Error fetching posts: ", errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [token, router]);

    // Initial fetch
    useEffect(() => {
        if (isAuthenticated && token) {
            fetchPosts(1);
        }
    }, [isAuthenticated, token, fetchPosts]);

    // Infinite scroll
    useEffect(() => {
        if (inView && hasMore && !isLoading && isAuthenticated) {
            const nextPage = page + 1;
            fetchPosts(nextPage);
            setPage(nextPage);
        }
    }, [inView, hasMore, isLoading, isAuthenticated, fetchPosts, page]);

    const handleLike = useCallback(async (postId: string) => {
        try {
            const response = await fetch(`${API_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to like post');

            return response.json();
        } catch (error) {
            console.error('Like error:', error);
        }
    }, []);

    const handleFollow = useCallback(async (userId: string) => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}/follow`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to follow user');
        } catch (error) {
            console.error('Follow error:', error);
        }
    }, []);

    const handleComment = useCallback(async (postId: string) => {
        try {
            // Implement comment logic
            console.log('Comment clicked for post:', postId);
        } catch (error) {
            console.error('Comment error:', error);
        }
    }, []);

    if (authLoading) {
        return (
            <div className="bg-slate-900 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!isAuthenticated || !token) {
        return null;
    }

    return (
        <div className="bg-slate-900 min-h-screen">
            <Header />
            <div className="max-w-2xl mx-auto pt-16 px-4">
                {error && (
                    <div className="text-red-500 p-4 rounded bg-red-100 mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {posts.map((post) => (
                        <Post
                            key={post._id}
                            post={post}
                            onLike={() => handleLike(post._id)}
                            onFollow={() => handleFollow(post.user_id)}
                            onComment={() => handleComment(post._id)}
                        />
                    ))}
                </div>

                <div ref={ref} className="py-4">
                    {isLoading && (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Feed;