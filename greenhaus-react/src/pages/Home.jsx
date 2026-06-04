import PostCard from "../components/feed/PostCard";

function Home() {
  return (
    <div className="feed-container">
      <h1
        style={{
          marginBottom: "2rem",
          color: "#67ffb3",
        }}
      >
        Home Feed
      </h1>

      <PostCard />
      <PostCard />
      <PostCard />
    </div>
  );
}

export default Home;