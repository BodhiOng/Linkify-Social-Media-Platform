import { useState, useCallback } from 'react';

interface IPost {
    _id: string;
    user_id: string;
    content: string;
    username: string;
    image_url: string;
    likes_count: number;
    comments_count: number;
    is_liked?: boolean;
}

interface PostProps {
    post: IPost;
    onLike: () => Promise<void>;
    onFollow: () => Promise<void>;
    onComment: () => Promise<void>;
}

const Post: React.FC<PostProps> = ({ post, onLike, onFollow, onComment }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [isLoading, setIsLoading] = useState(false);

    const handleLike = useCallback(async () => {
        if (isLoading) return;
        
        try {
            setIsLoading(true);
            await onLike();
            setIsLiked(prev => !prev);
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        } catch (error) {
            console.error('Error handling like:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isLiked, onLike, isLoading]);

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
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
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