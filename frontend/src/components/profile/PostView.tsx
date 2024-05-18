import ActiveLink from '../ui/links/active-link';
import { useState, useContext, useEffect } from 'react';

import { GoHeart } from 'react-icons/go';
import { GoHeartFill } from 'react-icons/go';
import AvatarIPFS from '@/components/ui/avatar-ipfs';
import UserIMage from '@/assets/images/user.png';
import Avatar from '@/components/ui/avatar';
import { IPFSHash } from '@/app/shared/types';
import { IdentityContext } from '@/app/shared/IdentityContext';
import { increaseLikes, decreaseLikes } from '@/app/shared/central-server';
interface PostType {
  id: number;
  createdBy: number;
  username: string;
  post: string;
  image: string;
  profilePic: IPFSHash;
  time: number;
  totalLikes: number;
  liked?: number | undefined | null;
}

const Post = ({
  post,
  isOrganisation = false,
}: {
  post: PostType;
  isOrganisation: boolean;
}) => {
  const { getIdentity } = useContext(IdentityContext);
  const [liked, setliked] = useState(false);
  const [totolLikes, setTotalLikes] = useState(post.totalLikes);
  useEffect(() => {
    if (!isOrganisation) {
      if (post?.liked == 1) {
        setliked(true);
      }
    }
  }, []);
  const handleLike = async () => {
    getIdentity().then(async (identity) => {
      if (liked) {
        const res = await decreaseLikes(
          post.id,
          identity.user,
          identity.time,
          identity.rsv.r,
          identity.rsv.s,
          identity.rsv.v,
        );
        if (res) {
          setliked(false);
          setTotalLikes(totolLikes - 1);
        }
      } else {
        const res = await increaseLikes(
          post.id,
          identity.user,
          identity.time,
          identity.rsv.r,
          identity.rsv.s,
          identity.rsv.v,
        );
        if (res) {
          setliked(true);
          setTotalLikes(totolLikes + 1);
        }
      }
    });
  };
  return (
    <div className="post shadow-lg rounded-3xl  p-6">
      <div className="container">
        <div className="user flex items-center justify-between">
          <div className="userInfo flex items-center gap-4">
            {post && post?.profilePic && post?.profilePic.size != 0 && (
              <AvatarIPFS
                hash={post?.profilePic}
                // size="sm"
                alt="Author"
                // className="z-10 mx-auto -mt-12 dark:border-gray-500 sm:-mt-14 md:mx-0 md:-mt-16 xl:mx-0 3xl:-mt-20"
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            {post && post?.profilePic && post?.profilePic.size == 0 && (
              <Avatar
                // size="xl"
                image={UserIMage}
                alt="Author"
                // className="z-10 mx-auto -mt-12 dark:border-gray-500 sm:-mt-14 md:mx-0 md:-mt-16 xl:mx-0 3xl:-mt-20"
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div className="details flex flex-col">
              <ActiveLink
                href={`/organisation/${post.createdBy}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
                className="name font-semibold"
              >
                {post.username}
              </ActiveLink>
              <span className="date text-xs">
                {new Date(post.time).toDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="content mt-4">
          <p>{post.post}</p>
          <img
            src={post.image}
            alt=""
            className="mx-auto max-h-80 object-cover mt-4"
          />
        </div>

        <div className="info flex items-center gap-4 mt-4">
          <div className="item flex items-center gap-2 cursor-pointer text-sm">
            {liked ? (
              <GoHeartFill
                className="text-red-500"
                aria-disabled={isOrganisation}
                onClick={() => {
                  handleLike();
                }}
              />
            ) : (
              <GoHeart
                className="text-gray-500"
                aria-disabled={isOrganisation}
                onClick={() => {
                  handleLike();
                }}
              />
            )}
            <span>{totolLikes} Likes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
