import { useFeed } from "../../hooks/useFeed";
import { getUserById } from "../../mocks/users";
import RequestCard from "../../components/feed/RequestCard";
import OfferCard from "../../components/feed/OfferCard";
import Spinner from "../../components/ui/Spinner";

export default function ForYouPage() {
  const { posts, isLoading } = useFeed("forYou");

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
        <Spinner />
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div style={{ textAlign: "center", paddingTop: 60, color: "#9CA3AF" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚗</div>
        <p style={{ fontSize: 15 }}>No rides posted yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 12px" }}>
      {posts.map((post) => {
        const author = getUserById(post.authorId);
        return post.type === "request"
          ? <RequestCard key={post.id} post={post} author={author} />
          : <OfferCard   key={post.id} post={post} author={author} />;
      })}
    </div>
  );
}
