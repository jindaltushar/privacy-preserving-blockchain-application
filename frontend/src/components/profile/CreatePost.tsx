import AvatarIPFS from '@/components/ui/avatar-ipfs';
import Buttom from '@/components/ui/button';
import UserIMage from '@/assets/images/user.png';
import { PiImageBold } from 'react-icons/pi';
import Avatar from '@/components/ui/avatar';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { useState, useEffect, useContext } from 'react';
import imageCompression from 'browser-image-compression';
import { selectedProfileAtom } from '@/stores/atoms';
import { useRecoilValue } from 'recoil';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';

const CreatePost = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const { createPost } = useContext(ProfileContractContext);
  const selectedProfile = useRecoilValue(selectedProfileAtom);
  const [loading, setLoading] = useState(false);
  const [posttext, setPostText] = useState('');
  const handlevaluechange = (e) => {
    setPostText(e.target.value);
  };
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage(reader.result);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const submitPost = async () => {
    setLoading(true);
    const res = await createPost(posttext, selectedImage);
    if (res) {
      setPostText('');
      setSelectedImage(null);
      //reload window
      window.location.reload();
    }
    setLoading(false);
  };

  const handleDeleteImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="share shadow-lg rounded-3xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 mb-4 w-full">
      <div className="p-5">
        <div className="flex items-center gap-5">
          {selectedProfile?.value &&
            selectedProfile?.value.organisationProfilePhotoHash &&
            selectedProfile?.value.organisationProfilePhotoHash.size !== 0 && (
              <AvatarIPFS
                // @ts-ignore
                hash={selectedProfile?.value.organisationProfilePhotoHash}
                size="md"
                alt="Author"
                className="dark:border-gray-500"
              />
            )}
          {selectedProfile?.value &&
            selectedProfile?.value.organisationProfilePhotoHash &&
            selectedProfile?.value.organisationProfilePhotoHash.size === 0 && (
              <Avatar
                size="md"
                image={UserIMage}
                alt="Author"
                className="dark:border-gray-500"
              />
            )}
          <textarea
            value={posttext}
            onChange={handlevaluechange}
            placeholder={`What's on your mind ${selectedProfile.value.organisationName}?`}
            className="border-none px-4 py-2 bg-transparent w-full text-gray-900 dark:text-gray-200 focus:outline-none focus:border-transparent overflow-hidden"
          />
        </div>

        {selectedImage && (
          <div className="relative mt-3">
            <img src={selectedImage} alt="Selected" className="w-auto h-auto" />
            <AiOutlineCloseCircle
              className="absolute top-0 right-0 text-red-500 cursor-pointer"
              size={20}
              onClick={handleDeleteImage}
            />
          </div>
        )}

        <hr className="my-5 border-t border-gray-300 dark:border-gray-700" />
        <div className="bottom flex items-center justify-between">
          <div className="left flex items-center gap-5">
            <input
              type="file"
              id="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <label htmlFor="file">
              <div className="item flex items-center gap-2 cursor-pointer">
                <PiImageBold size={20} />
                <span className="text-gray-500 text-sm">Add Image</span>
              </div>
            </label>
          </div>
          <div className="right">
            <Buttom
              className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer"
              isLoading={loading}
              onClick={submitPost}
            >
              Share
            </Buttom>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
