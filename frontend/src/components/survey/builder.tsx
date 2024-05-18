'use client';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import {
  nodesAtom,
  selectedNodeIndexAtom,
  isSurveyPrivacySetAtom,
  currentFormIndexAtom,
  formAtom,
  masterSettingsAtom,
  viewMasterSurveySetttingsAtom,
  showSurveyFinalCreatePageAtom,
} from '@/stores/atoms';
import React, { useEffect } from 'react';
import SurveyFormCreate from '@/components/survey/surveyFormCreate';
import PublicPrivateChoose from '@/components/survey/publicPrivateChoose';
import SurveyMasterSettings from '@/components/survey/surveyMasterSettings';
import SurveySubmit from '@/components/survey/surveySubmit';
export default function Builder() {
  const setNodes = useSetRecoilState(nodesAtom);
  const setSelectedNodeIndex = useSetRecoilState(selectedNodeIndexAtom);
  const setFormIndex = useSetRecoilState(currentFormIndexAtom);
  const setForm = useSetRecoilState(formAtom);
  const setMasterSettings = useSetRecoilState(masterSettingsAtom);
  const [privacyset, setPrivacyIsSet] = useRecoilState(isSurveyPrivacySetAtom);
  const [showSurveyFinalCreatePage, setShowSurveyFinalCreatePage] =
    useRecoilState(showSurveyFinalCreatePageAtom);
  const [viewMasterSurveySettings, setViewMasterSurveySettings] =
    useRecoilState(viewMasterSurveySetttingsAtom);
  useEffect(() => {
    setPrivacyIsSet(false);
    return () => {
      // Cleanup function to set nodes to empty array on unmount
      setNodes([]);
      setSelectedNodeIndex(undefined);
      setFormIndex(0);
      setForm([]);
      setMasterSettings({
        name: null,
        audience: null,
        is_survey_private: false,
        publish_on_marketplace: false,
        survey_visibility: null,
        survey_expiry_date: { startDate: null, endDate: null },
        survey_audience_size: 0,
        introduction: '',
        survey_validity_type: null,
        has_valid_expiry: false,
      });
      setPrivacyIsSet(false);
      setViewMasterSurveySettings(false);
      setShowSurveyFinalCreatePage(false);
    };
  }, []);

  if (privacyset && !viewMasterSurveySettings && !showSurveyFinalCreatePage) {
    return <SurveyFormCreate />;
  } else if (privacyset && viewMasterSurveySettings) {
    return <SurveyMasterSettings />;
  } else if (showSurveyFinalCreatePage && privacyset) {
    return <SurveySubmit />;
  } else {
    return <PublicPrivateChoose />;
  }
}
