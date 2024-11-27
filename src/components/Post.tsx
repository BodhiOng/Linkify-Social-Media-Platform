import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

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

interface PostProps {
    post: IPost;
    onLike: () => Promise<void>;
    onFollow: () => Promise<void>;
    onComment: () => Promise<void>;
}

const Post: React.FC<PostProps> = ({ post, onLike, onFollow, onComment }) => {
    // Use the auth context to get the current user
    const { user } = useAuth();

    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [isLoading, setIsLoading] = useState(false);

    // Update effect to always check likes array first
    useEffect(() => {
        console.log('User:', user); // Debugging log
        console.log('Post Likes:', post.likes); // Debugging log

        if (user) {
            console.log("User ID:", user._id);
            const likedByUser = post.likes?.includes(user._id) || post.is_liked || false;
            console.log('Liked by User:', likedByUser); // Debugging log
            setIsLiked(likedByUser);
        } else {
            setIsLiked(false);
        }
    }, [user, post.likes, post.is_liked]);
    
    const handleLike = useCallback(async () => {
        if (isLoading || !user) return;
        
        try {
            setIsLoading(true);
            const newLikedState = !isLiked;

            // Optimistic update
            setIsLiked(newLikedState);
            setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
        
            // Make API call
            await onLike();
        } catch (error) {
            console.error('Error handling like:', error);
            // Revert to the original state based on the like array
            const wasLikedByUser = post.likes?.includes(user._id) || post.is_liked || false;
            setIsLiked(wasLikedByUser);
            setLikesCount(post.likes_count || 0);
        } finally {
            setIsLoading(false);
        }
    }, [isLiked, onLike, isLoading, user, post.likes, post.likes_count]);

    const handleFollow = useCallback(async () => {
        try {
            await onFollow();
        } catch (error) {
            console.error('Error handling follow:', error);
        }
    }, [onFollow]);

    const handleComment = useCallback(async () => {
        try {
            await onComment();
        } catch (error) {
            console.error('Error handling comment:', error);
        }
    }, [onComment]);

    return (
        <div className="bg-slate-800 rounded-lg p-4 shadow">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
                <img 
                    src={`https://ui-avatars.com/api/?name=${post.username}`} 
                    alt={post.username} 
                    className="w-10 h-10 rounded-full"
                />
                <div className="font-bold text-white cursor-pointer hover:underline">
                    {post.username}
                </div>
            </div>
            <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-full text-sm"
                onClick={onFollow}
            >
                Follow
            </button>
        </div>

            <div className="text-white mb-4">
                {post.content}
            </div>

            <div className="flex gap-3">
                <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${isLiked
                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    onClick={handleLike}
                    disabled={isLoading}
                >
                    <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
                    <span className="font-medium">Like</span>
                    {likesCount > 0 && (
                        <span className={`text-xs ${isLiked ? 'text-red-400' : 'text-gray-400'}`}>
                            {likesCount}
                        </span>
                    )}
                </button>

                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={onComment}
                >
                    <span className="text-lg">💬</span>
                    <span className="font-medium">Comment</span>
                    {post.comments_count > 0 && (
                        <span className="text-xs text-gray-400">
                            {post.comments_count}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Post;