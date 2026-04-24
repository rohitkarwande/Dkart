import { useAuthStore } from '../../store/useAuthStore';

const Profile = () => {
  const { profile } = useAuthStore();

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      <div className="profile-details-card">
        <p><strong>Name:</strong> {profile?.full_name || 'Not set'}</p>
        <p><strong>Company:</strong> {profile?.company_name || 'Not set'}</p>
        <p><strong>Role:</strong> {profile?.role || 'User'}</p>
        <p><strong>Status:</strong> {profile?.is_verified ? '✅ Verified' : '❌ Unverified'}</p>
      </div>
    </div>
  );
};

export default Profile;
