'use client';
import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyContractContext } from '@/contracts-context/SurveyContractContext';
import { ProfileContractContext } from '@/contracts-context/ProfileContractContext';
import { toast } from 'sonner';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
export default function RespondToSurveyPage({
  surveyId,
}: {
  surveyId: string;
}) {
  const [progress, setProgress] = useState(0);
  // const { getSurveyData } = useContext(SurveyContractContext);
  const { currentProfileSelected } = useContext(ProfileContractContext);
  const router = useRouter();
  useEffect(() => {
    if (!currentProfileSelected?.value?.userId) {
      toast.error(
        'Please change to your Individual Profile to respond to this survey',
      );
      router.push('/');
    }
  }, []);
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Clean up function to enable scrolling when the component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  return (
    // make a div whole max size is 100%vh - 30px
    <div className="h-full w-full">
      <Box sx={{ width: '100%' }}>
        <LinearProgress variant="determinate" color="inherit" value={50} />
      </Box>
    </div>
  );
}
