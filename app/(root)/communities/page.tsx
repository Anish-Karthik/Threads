import CommunityCard from "@/components/cards/CommunityCard";
import Pagination from "@/components/shared/Pagination";
import Searchbar from "@/components/shared/Searchbar";
import { fetchCommunities } from "@/lib/actions/community.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation';

const CommunityPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await currentUser()

  if(!user)  return null;
  const userInfo = await fetchUser(user.id);
  if(!userInfo?.onboarded) redirect('/onboarding');

  const result = await fetchCommunities({
    searchString: searchParams?.q || '',
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 2,
  });

  return (
    <section>
      <div className='flex items-center gap-9'>
        <h1 className='head-text'>Search</h1>
        <Searchbar routeType='communities'/>
      </div>
      <div className='mt-14 flex justify-evenly flex-wrap gap-9'>
        {!result.communities || result.communities.length === 0 ? (
          <p className='no-result'>No Communities</p>
        ) : (
          <>
            {result.communities.map((community) => (
              <CommunityCard key={community.id} 
                id={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                bio={community.bio}
                members={community.members}
              />
          ))}
          </>
        )}
      </div>
      <Pagination
        path='communities'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </section>
  )
}

export default CommunityPage