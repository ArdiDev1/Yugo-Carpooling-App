import { useQuery } from "@tanstack/react-query";
import { postService } from "../services/post.service";
import { MOCK_POSTS } from "../mocks/posts";
import { useFeedStore } from "../store/feed.store";

const USE_MOCK = true; // flip to false once backend is ready

export function useFeed(tab = "forYou") {
  const { user } = useFeedStore();

  const queryFn = tab === "forYou"
    ? () => postService.getFeed()
    : () => postService.getFollowing();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["feed", tab],
    queryFn,
    enabled: !USE_MOCK,
  });

  if (USE_MOCK) {
    return {
      posts:     MOCK_POSTS,
      isLoading: false,
      error:     null,
      refetch:   () => {},
    };
  }

  return {
    posts:     data?.data ?? [],
    isLoading,
    error,
    refetch,
  };
}
