import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import UserSecurityCard from "../components/UserProfile/UserSecurityCard";
import PageMeta from "../components/common/PageMeta";
import PageContainer from "../components/layout/PageContainer";

export default function UserProfiles() {
  return (
    <>
      <PageMeta
        title="Profile Dashboard | Cherry Admin"
        description="Manage your profile, company details, and security settings."
      />
      <PageContainer>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xl dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
          <div className="space-y-8">
            <UserMetaCard />
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              <UserInfoCard />
              <UserAddressCard />
            </div>
            <UserSecurityCard />
          </div>
        </div>
      </PageContainer>
    </>
  );
}
