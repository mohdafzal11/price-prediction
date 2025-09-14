import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import styled from 'styled-components';
import { Container } from 'styled/elements/Container';
import ProfileInfo from 'components/pages/community/ProfileInfo/ProfileInfo';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import SEO from 'components/SEO/SEO';
import Tabs from 'components/common/Tabs';
import dynamic from 'next/dynamic';

const ProfilePosts = dynamic(() => import('components/pages/community/ProfilePosts/ProfilePosts'), {
  loading: () => <ComponentLoader />,
  ssr: false
});

const EditProfileForm = dynamic(() => import('components/pages/community/EditProfileForm/EditProfileForm'), {
  loading: () => <ComponentLoader />,
  ssr: false
});

const ComponentLoader = () => (
  <LoaderWrapper>
    <div>Loading...</div>
  </LoaderWrapper>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
};

const tabs = [
  { id: 'posts', label: 'Posts' },
  { id: 'edit', label: 'Edit Profile' },
  { id: 'settings', label: 'Settings' },
];

interface ProfileProps {
  user: {
    id: string;
    email: string;
    username: string;
    displayName?: string;
    image?: string;
    createdAt: string;
  };
}

const Profile = ({ user }: ProfileProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('posts');

  if (!session) {
    router.push('/');
    return null;
  }
  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "name": `${user.displayName || user.email} | Profile`,
    "description": "User profile page",
    "url": `${process.env.NEXT_PUBLIC_URL || 'https://droomdroom.com'}/user/profile`,
    "mainEntity": {
      "@type": "Person",
      "name": user.displayName || user.email,
      "image": user.image || `${process.env.NEXT_PUBLIC_URL || 'https://droomdroom.com'}/default-avatar.png`,
      "url": `${process.env.NEXT_PUBLIC_URL || 'https://droomdroom.com'}/user/profile`
    }
  };

  return (
    <>
      <SEO
        title={`${user.displayName || user.email} | Profile`}
        description="User profile page"
        structuredData={[profileSchema]}
      />
      <ProfileContainer>
        <ProfileInfo user={user} />
        <TabsWrapper>
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </TabsWrapper>
        <ContentWrapper>
          {activeTab === 'posts' && <ProfilePosts userId={user.id} />}
          {activeTab === 'edit' && <EditProfileForm user={user} />}
          {activeTab === 'settings' && (
            <div>Settings coming soon...</div>
          )}
        </ContentWrapper>
      </ProfileContainer>
    </>
  );
};

const ProfileContainer = styled(Container)`
  padding-top: 2rem;
`;

const TabsWrapper = styled.div`
  margin: 2rem 0;
`;

const ContentWrapper = styled.div`
  margin-bottom: 2rem;
`;

const LoaderWrapper = styled.div`
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
`;

export default Profile;
