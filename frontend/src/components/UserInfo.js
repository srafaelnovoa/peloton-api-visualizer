export function UserInfo({ userData }) {
  if (!userData) return null;

  return (
    <div className="mt-4">
      <h3>{userData.username}</h3>
      <img src={userData.image_url} className="img-fluid" alt="User" />
    </div>
  );
}
