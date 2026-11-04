import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { api } from "../lib/api";

export default function SinglePost({ slug, onBack }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDetails() {
      try {
        setLoading(true);
        const fetchedPost = await api.getPostBySlug(slug);
        if (!isMounted) return;
        setPost(fetchedPost);
        setLikeCount(fetchedPost.likeCount || 0);

        const fetchedComments = await api.getComments(fetchedPost._id);
        if (isMounted) setComments(fetchedComments);
      } catch (err) {
        console.error("Failed to load post details", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDetails();
    return () => { isMounted = false; };
  }, [slug]);

  const handleLike = async () => {
    if (!post) return;
    try {
      const res = await api.toggleLike(post._id);
      setLiked(res.liked);
      setLikeCount(res.likesCount);
    } catch (err) {
      alert("Please log in to like this post.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;
    try {
      await api.addComment(post._id, newComment);
      const updated = await api.getComments(post._id);
      setComments(updated);
      setNewComment("");
    } catch (err) {
      alert("Please log in to comment.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-gray-400">
          <i className="fa-solid fa-spinner animate-spin text-3xl text-emerald-600 mr-3"></i> Loading story...
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center">
          <p className="text-red-500 mb-4">Story not found.</p>
          <button onClick={onBack} className="px-4 py-2 bg-gray-900 text-white rounded-full text-xs">Back</button>
        </div>
        <Footer />
      </div>
    );
  }

  const imageUrl = post.coverImage?.url || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80";
  const categoryName = post.category?.name || post.category || "GENERAL";
  const authorName = post.author?.name || "Author";

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <button onClick={onBack} className="mb-6 text-xs font-bold text-gray-500 hover:text-emerald-600 flex items-center gap-2">
          <i className="fa-solid fa-arrow-left"></i> Back to stories
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-3">
          {categoryName}
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-between py-4 border-y border-gray-100 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
              {authorName[0]}
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">{authorName}</h4>
              <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all ${
              liked ? 'border-red-200 text-red-500 bg-red-50' : 'border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600'
            }`}
          >
            <i className={`${liked ? 'fa-solid' : 'fa-regular'} fa-heart text-sm`}></i>
            <span>{likeCount}</span>
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden mb-8 shadow-sm">
          <img src={imageUrl} alt={post.title} className="w-full h-[380px] object-cover" />
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 font-serif leading-relaxed space-y-6 mb-16">
          {post.body}
        </div>

        {/* COMMENTS SECTION */}
        <section className="pt-10 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Comments <span className="text-sm bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">{comments.length}</span>
          </h3>

          <form onSubmit={handleCommentSubmit} className="mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts on this story?"
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <div className="flex justify-end mt-3">
              <button type="submit" className="px-5 py-2 bg-emerald-600 text-white text-xs font-medium rounded-full hover:bg-emerald-500">
                Post Comment
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c._id} className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-xs text-gray-900">{c.author?.name || 'User'}</span>
                  <span className="text-[11px] text-gray-400">{new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}