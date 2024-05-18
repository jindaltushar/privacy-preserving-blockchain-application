import Form from '@/components/survey/surveyFormView';
import { useRecoilState } from 'recoil';
import { nodesAtom } from '@/stores/atoms';
import { fixOptionstoStrAns } from '@/components/survey/helpers';
export default function SurveyPreviewModal() {
  const [nodes, setNodes] = useRecoilState(nodesAtom);
  return (
    <div>
      <Form data={fixOptionstoStrAns(nodes)} />
    </div>
  );
}
