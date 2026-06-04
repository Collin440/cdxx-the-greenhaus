import "./RightSidebar.css";

function RightSidebar() {
  return (
    <aside className="right-sidebar">
      <div className="widget">
        <h3>Trending</h3>

        <p>#LateNightCoding</p>
        <p>#420Sessions</p>
        <p>#NeoSoulNights</p>
      </div>

      <div className="widget">
        <h3>Online Friends</h3>

        <p>Xana</p>
        <p>Kairo</p>
        <p>Lebo</p>
      </div>
    </aside>
  );
}

export default RightSidebar;