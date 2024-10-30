import React from 'react';

interface IPost {
    _id: string;
    user_id: string;
    content: string;
    username: string;
    image_url: string;
    likes_count: number;
    comments_count: number;
}

interface PostProps {
    post: IPost;
    onLike: () => Promise<void>;
    onFollow: () => Promise<void>;
    onComment: () => Promise<void>;
}

const Post: React.FC<PostProps> = ({ post, onLike, onFollow, onComment }) => {
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

            <div className="flex space-x-4">
                <button
                    className="text-gray-300 hover:text-white flex items-center space-x-1"
                    onClick={onLike}
                >
                    <span>❤️</span>
                    <span>Like</span>
                </button>
                <button
                    className="text-gray-300 hover:text-white flex items-center space-x-1"
                    onClick={onComment}
                >
                    <span>💬</span>
                    <span>Comment</span>
                </button>
            </div>
        </div>
    );
};

export default Post;