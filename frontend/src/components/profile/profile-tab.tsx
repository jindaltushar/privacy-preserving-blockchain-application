'use client';
import { Suspense, useState, useEffect } from 'react';
import { useContext } from 'react';
import ListCard from '@/components/ui/list-card';
import ParamTab, { TabPanel } from '@/components/ui/param-tab';
import CreatePost from '@/components/profile/CreatePost';
import { useRecoilState } from 'recoil';
import { OrganisationIdUsernameMapping } from '@/stores/atoms';
import Post from '@/components/profile/PostView';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { IdentityContext } from '@/app/shared/IdentityContext';
import Loader from '@/components/ui/loader';
import { generateRandomString } from '@/app/shared/utils';
import {
  getPostsForOrganisation,
  getPostsForUser,
} from '@/app/shared/central-server';

const postData = {
  userImage: 'path/to/user/image.jpg',
  title: 'Post Title',
  createdAt: 'April 15, 2024',
  image: 'path/to/post/image.jpg',
  text: 'Post content goes here...',
};

export default function ProfileTab({
  isOrganisation = false,
  isOtherOrganisation = false,
  orgId = 0,
}) {
  const [organisationUsernameMapping, setOrganisationUsernameMapping] =
    useRecoilState(OrganisationIdUsernameMapping);
  const { findUserNameFromUserId } = useContext(ProfileContractContext);
  const [feedPosts, setFeedPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  var tabMenu = [];
  if (isOrganisation) {
    tabMenu = [
      {
        title: 'Feed',
        path: 'feed',
      },
    ];
  } else {
    tabMenu = [
      {
        title: 'Explore',
        path: 'explore',
      },
      {
        title: `Following (${followingPosts.length})`,
        path: 'following',
      },
    ];
  }
  const { getIdentity } = useContext(IdentityContext);
  useEffect(() => {
    const getOrganisationUserName = async (orgId) => {
      //check if username is already fetched
      if (organisationUsernameMapping[orgId]) {
        return organisationUsernameMapping[orgId];
      }
      const data = await findUserNameFromUserId(orgId);
      setOrganisationUsernameMapping((oldMapping) => ({
        ...oldMapping,
        [orgId]: {
          username: data.username,
          profilePic: data.ipfs,
        },
      }));
      return { username: data.username, profilePic: data.ipfs };
    };

    const insidefn = async () => {
      if (isOrganisation) {
        getPostsForOrganisation(orgId).then(async (data) => {
          console.log('raw', data);
          var newData = await Promise.all(
            data.map(async (post) => {
              data = await getOrganisationUserName(post.createdBy);
              post.username = data.username;
              post.profilePic = data.profilePic;
              return post;
            }),
          );
          console.log('new', newData);
          // Do something with newData
          setFeedPosts(newData);
        });
      } else {
        getIdentity().then((identity) => {
          getPostsForUser(
            identity.user,
            identity.time,
            identity.rsv.r,
            identity.rsv.s,
            identity.rsv.v,
          ).then(async (data) => {
            var newFollowingData = await Promise.all(
              data.posts.map(async (post) => {
                data = await getOrganisationUserName(post.createdBy);
                post.username = data.username;
                post.profilePic = data.profilePic;
                return post;
              }),
            );
            setFollowingPosts(newFollowingData);
            if (data?.latestPosts) {
              var newData = await Promise.all(
                data?.latestPosts.map(async (post) => {
                  data = await getOrganisationUserName(post.createdBy);
                  post.username = data.username;
                  post.profilePic = data.profilePic;
                  return post;
                }),
              );
              setFeedPosts(newData);
            }
          });
        });
      }
    };

    insidefn();
  }, []);

  return (
    <Suspense fallback={<Loader variant="blink" />}>
      <ParamTab tabMenu={tabMenu}>
        <TabPanel className="focus:outline-none">
          {isOrganisation && !isOtherOrganisation && <CreatePost />}

          {feedPosts.map((post) => (
            <Post
              key={post.id + generateRandomString(20)}
              post={post}
              isOrganisation={isOrganisation}
            />
          ))}
          {feedPosts.length == 0 && (
            <div className="flex justify-center items-center h-96">
              Nothing to show here
            </div>
          )}
        </TabPanel>
        <TabPanel className="focus:outline-none">
          {followingPosts.map((post) => (
            <Post
              key={post.id + generateRandomString(20)}
              post={post}
              isOrganisation={isOrganisation}
            />
          ))}
          {followingPosts.length == 0 && (
            <div className="flex justify-center items-center h-96">
              Nothing to show here
            </div>
          )}
        </TabPanel>
      </ParamTab>
    </Suspense>
  );
}
