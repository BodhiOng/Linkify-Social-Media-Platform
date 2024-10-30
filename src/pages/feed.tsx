import { useEffect, useState } from "react";
import { useInView } from 'react-intersection-observer';
import Header from "../components/Header";
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
    const [isClient, setIsClient] = useState(false);
    const { ref, inView } = useInView();

    // Set isClient to true once component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchPosts = async (pageNum: number) => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:4000/api/feed?page=${pageNum}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
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
    };

    useEffect(() => {
        if (isClient) {
            fetchPosts(1);
        }
    }, [isClient]);

    useEffect(() => {
        if (inView && hasMore && !isLoading && isClient) {
            fetchMorePosts();
        }
    }, [inView, isClient]);

    const fetchMorePosts = async () => {
        if (!isLoading && hasMore) {
            const nextPage = page + 1;
            await fetchPosts(nextPage);
            setPage(nextPage);
        }
    };

    const handleLike = async (postId: string): Promise<void> => {
        try {
            const response = await fetch(`/api/posts/${postId}/like`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to like post');

            // Update posts state optimistically
            setPosts(prev => prev.map(post =>
                post._id === postId
                    ? { ...post, likes_count: post.likes_count + 1 }  // Now this will work
                    : post
            ));
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    const handleFollow = async (userId: string): Promise<void> => {
        try {
            const response = await fetch(`/api/users/${userId}/follow`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to follow user');

            // Update UI accordingly
        } catch (error) {
            console.error("Error following user:", error);
        }
    };

    const handleComment = async (postId: string): Promise<void> => {
        try {
            // Implement comment functionality
            // Could open a comment modal or navigate to comment section
        } catch (error) {
            console.error("Error commenting on post:", error);
        }
    };

    if (!isClient) {
        return (
            <div className="bg-slate-900 min-h-screen">
                <Header />
                <div className="max-w-2xl mx-auto pt-16 px-4">
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-slate-800 rounded-lg p-4 shadow animate-pulse">
                                <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
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