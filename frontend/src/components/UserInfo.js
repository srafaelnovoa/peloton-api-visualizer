export function UserInfo({ userData }) {
  if (!userData) return null;

  return (
    <div className="mt-4">
      <h2>User Info</h2>
      <div>Username: {userData.username}</div>
      <img src={userData.image_url} className="img-fluid" alt="User" />
    </div>
  );
}
