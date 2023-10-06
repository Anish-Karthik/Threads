import UserCard from '@/components/cards/UserCard';
import ProfileHeader from '@/components/shared/ProfileHeader';
import ThreadsTab from '@/components/shared/ThreadsTab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { profileTabs } from '@/constants';
import { fetchInvitedCommunities } from '@/lib/actions/user.actions';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs'
import Image from 'next/image';
import { redirect } from 'next/navigation';
import React from 'react'

const ProfilePage = async ({ params }: { params: {id: string } }) => {
  const user = await currentUser()

  if(!user)  return null;

  const userInfo = await fetchUser(params.id);
  if(!userInfo) return redirect('/');
  if(!userInfo?.onboarded) redirect('/onboarding');

  const communityInvites = await fetchInvitedCommunities(userInfo.uid);


  return (
    <section>
      <ProfileHeader 
        accountId={userInfo.uid}
        authUserId={user.id}
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
        editable={user.id === userInfo.uid}
      />

      <div className='mt-9'>
        <Tabs defaultValue='threads' className='w-full'>
          <TabsList className='tab'>
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className='object-contain'
                />
                <p className='max-sm:hidden'>{tab.label}</p>

                {tab.label === 'Threads' && (
                  <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>{userInfo?.threads?.length}</p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {profileTabs.map((tab, ind) => {
            if(tab.label === "Invites") 
              return (
                <TabsContent key={tab.label} value={tab.value} className='w-full text-light-1'>
                  {communityInvites && communityInvites.map((invitedCommunity) => (
                    <UserCard
                      key={invitedCommunity.id}
                      id={invitedCommunity.cid}
                      name={invitedCommunity.name}
                      username={invitedCommunity.cid}
                      imgUrl={invitedCommunity.image}
                      personType='Community'
                      
                    />
                  ))}
                </TabsContent>
              )


            return (<TabsContent key={tab.label} value={tab.value} className='w-full text-light-1'>
              <ThreadsTab
                currentUserId={user.id}
                accountId={userInfo.uid}
                accountType="User"
              />
            </TabsContent>)
          })}
        </Tabs>
      </div>

    </section>
  )
}

export default ProfilePage