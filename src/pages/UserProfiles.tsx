import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import UserSecurityCard from "../components/UserProfile/UserSecurityCard";
import PageMeta from "../components/common/PageMeta";
import PageContainer from "../components/layout/PageContainer";
import { usePageHeader } from "../context/PageHeaderContext";
import { useEffect } from "react";
import { contentService } from "../services/content.service";

export default function UserProfiles() {
  const { setPageHeader } = usePageHeader();

  useEffect(() => {
    const loadMetadata = async () => {
      const meta = await contentService.getPageMetadata('user-profiles');
      if (meta) {
        setPageHeader(meta.titleMain || 'Account Settings', meta.description || '');
      } else {
        setPageHeader(
          "Account Settings",
          "Manage your personal profile, company details, and security settings."
        );
      }
    };
    loadMetadata();
  }, [setPageHeader]);

  return (
    <>
      <PageMeta
        title="Profile Dashboard | Cherry Admin"
        description="Manage your profile, company details, and security settings."
      />
      <PageContainer className="h-[calc(100vh-64px)] flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar pb-12">
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
