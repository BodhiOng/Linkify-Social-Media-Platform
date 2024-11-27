import { useEffect, useState, useCallback } from "react";
import { useInView } from 'react-intersection-observer';
import { useRouter } from "next/router";
import dynamic from 'next/dynamic';
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";

interface IPost {
    _id: string;
    user_id: string;
    content: string;
    username: string;
    image_url: string;
    likes?: string[];
    likes_count: number;
    comments_count: number;
    is_liked?: boolean;
    is_following?: boolean;
    createdAt: string;
    updatedAt: string;
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
    const router = useRouter();
    const [posts, setPosts] = useState<IPost[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const { ref, inView } = useInView();
    const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();

    // Single authentication check
    useEffect(() => {
        if (!authLoading) {  // Only check after auth state is determined
            const storedToken = localStorage.getItem('token');
            if (!storedToken || !isAuthenticated || !token) {
                router.replace('/login');
            }
        }
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
            console.log('Fetched posts:', data.posts); // Log the fetched posts
            
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
            const response = await fetch(`api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to like post');

            // Optimistically update the posts with safe checks
            setPosts(prevPosts => 
                prevPosts.map(post =>
                    post._id === postId
                    ? {
                        ...post,
                        // Ensure likes is always an array
                        likes: post.likes 
                            ? (post.likes.includes(user._id)
                                ? post.likes.filter(id => id !== user._id)
                                : [...post.likes, user._id])
                            : [user._id],
                        likes_count: post.likes?.includes(user._id)
                            ? (post.likes_count - 1)
                            : (post.likes_count + 1)
                    }
                    : post
                )
            );

            return response.json();
        } catch (error) {
            console.error('Like error:', error);
        }
    }, [token, user]);

    const handleFollow = useCallback(async (userId: string) => {
        try {
            const response = await fetch(`api/users/${userId}/follow`, {
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

    // Early return if not authenticated
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