import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Status } from "../../globals/types/types";
import {
  createReview,
  fetchReview,
  removeReview,
  editReview,
} from "../../store/reviewSlice";
import toast from "react-hot-toast";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  User?: {
    id: string;
    username: string;
  } | null;
}

interface ReviewProps {
  productId: string;
}

const Review: React.FC<ReviewProps> = ({ productId }) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editReviewId, setEditReviewId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const reviewStatus = useAppSelector((store) => store.reviews.status);
  const {review}  = useAppSelector((store) => store.reviews);
  

  const currentUserId = useAppSelector((store) => store.auth.user?.id);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchReview(productId));
  }, [dispatch, productId]);
  console.log(review,"review")

  const handleCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleRatingChange = (ratingValue: number) => {
    setRating(ratingValue);
  };
console.log(currentUserId, "currentUserId")
 const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  

  // Check if user is logged in
  if (!currentUserId) {
    toast.error("Please log in to submit a review.");
    return;
  }

  if (comment.length < 10 || comment.length > 1000) {
    toast.error("Comment must be between 10 and 1000 characters.");
    return;
  }

  if (rating < 1 || rating > 5) {
    toast.error("Please select a rating between 1 and 5.");
    return;
  }

  try {
    await dispatch(
      createReview({
        rating,
        comment,
        productId,
        id: "",
        userId: currentUserId,
        createdAt: new Date().toISOString(),
        User: { id: currentUserId, username: "" },
      })
    );
    await dispatch(fetchReview(productId));
    setComment("");
    setRating(0);
    toast.success("Review submitted!");
  } catch {
    toast.error("Failed to submit review.");
  }
};

  const handleDelete = async (reviewId: string) => {
    const reviewToDelete = review.find((r) => r.id === reviewId);

    if (reviewToDelete?.userId !== currentUserId) {
      toast.error("Unauthorized action.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await dispatch(removeReview(reviewId));
        toast.success("Review deleted.");
        setDropdownOpen(null);
      } catch {
        toast.error("Failed to delete review.");
      }
    }
  };

  const handleEdit = (item: ReviewItem) => {
    if (item.userId !== currentUserId) {
      toast.error("Unauthorized to edit this review.");
      return;
    }

    setEditReviewId(item.id);
    setEditComment(item.comment);
    setEditRating(item.rating);
    setEditModalOpen(true);
    setDropdownOpen(null);
  };

  const handleEditCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditComment(e.target.value);
  };

  const handleEditRatingChange = (ratingValue: number) => {
    setEditRating(ratingValue);
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editComment.length < 10 || editComment.length > 1000) {
      toast.error("Comment must be between 10 and 1000 characters.");
      return;
    }

    if (editRating < 1 || editRating > 5) {
      toast.error("Please select a rating between 1 and 5.");
      return;
    }

    try {
      if (editReviewId) {
        await dispatch(
          editReview(editReviewId, {
            rating: editRating,
            comment: editComment,
          })
        );
        toast.success("Review updated.");
        setEditModalOpen(false);
        setEditReviewId(null);
        setEditComment("");
        setEditRating(0);
      }
    } catch {
      toast.error("Failed to update review.");
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditReviewId(null);
    setEditComment("");
    setEditRating(0);
  };

  const toggleDropdown = (reviewId: string | null) => {
    setDropdownOpen(dropdownOpen === reviewId ? null : reviewId);
  };

  if (reviewStatus === Status.LOADING) {
    return <div className="text-center py-12">Loading reviews...</div>;
  }

  if (reviewStatus === Status.ERROR) {
    return (
      <div className="text-red-600 text-center py-12">
        Error loading reviews
      </div>
    );
  }
    console.log(review,"REview")


  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          Customer Reviews
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 mb-8">
            {review.length === 0 ? (
              <p className="text-gray-600 italic">No reviews yet.</p>
            ) : (
              review.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 bg-gray-100 rounded-md relative"
                >
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {item?.User?.username || "Anonymous"}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {new Date(item.createdAt ?? "").toLocaleDateString()}
                        </p>
                      </div>

                      {item.userId === currentUserId && (
                        <div className="relative">
                          <button
                            onClick={() => toggleDropdown(item.id)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          {dropdownOpen === item.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                              <button
                                onClick={() => handleEdit(item as ReviewItem)}
                                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => item.id && handleDelete(item.id)}
                                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(item.rating ?? 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600">{item.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-gray-100 p-6 rounded-md space-y-4"
          >
            <textarea
              className="px-4 py-3 bg-white text-gray-800 w-full text-sm rounded-md resize-none focus:outline-gray-600"
              placeholder="Write your comment..."
              rows={4}
              value={comment}
              onChange={handleCommentChange}
              required
            />
            <div className="flex items-center space-x-2">
              <span className="text-gray-800 font-semibold">Your Rating:</span>
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleRatingChange(i + 1)}
                  className={`text-2xl ${
                    i < rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="rounded-md px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit Review
            </button>
          </form>
        </div>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Edit Review
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <textarea
                className="px-4 py-3 bg-white text-gray-800 w-full text-sm rounded-md resize-none focus:outline-gray-600"
                placeholder="Edit your comment..."
                rows={4}
                value={editComment}
                onChange={handleEditCommentChange}
                required
              />
              <div className="flex items-center space-x-2">
                <span className="text-gray-800 font-semibold">
                  Your Rating:
                </span>
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleEditRatingChange(i + 1)}
                    className={`text-2xl ${
                      i < editRating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Review;
