import React from 'react';
import Button from '@/components/ui/button';
import { Tooltip } from 'react-tooltip';
import { QuestionIcon } from '../icons/question-icon';
import ActiveLink from '../ui/links/active-link';
const WhitebgTick = () => {
  return (
    <p className="text-gray-600 text-center h-12 flex items-center justify-center">
      <span className="w-5 h-5 inline-flex items-center justify-center bg-gray-500 text-white rounded-full flex-shrink-0">
        <svg
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          className="w-3 h-3"
          viewBox="0 0 24 24"
        >
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
      </span>
    </p>
  );
};
const GreybgTick = () => {
  return (
    <p className="bg-gray-100 text-gray-600 text-center h-12 flex items-center justify-center">
      <span className="w-5 h-5 inline-flex items-center justify-center bg-gray-500 text-white rounded-full flex-shrink-0">
        <svg
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          className="w-3 h-3"
          viewBox="0 0 24 24"
        >
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
      </span>
    </p>
  );
};

const WhiteBgText = ({ str }: { str: String }) => {
  return (
    <p className="h-12 text-gray-600 px-6 text-center leading-relaxed flex items-center justify-center">
      {str}
    </p>
  );
};

const GreyBgText = ({ str }: { str: String }) => {
  return (
    <p className="bg-gray-100 text-gray-600 h-12 text-center px-2 flex items-center -mt-px justify-center border-t border-gray-300">
      {str}
    </p>
  );
};

const WhiteBgCross = () => {
  return (
    <p className="text-gray-600 text-center h-12 flex items-center justify-center">
      <svg
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
        className="w-5 h-5 text-gray-500"
        viewBox="0 0 24 24"
      >
        <path d="M18 6L6 18M6 6l12 12"></path>
      </svg>
    </p>
  );
};

const GreyBgCross = () => {
  return (
    <p className="bg-gray-100 text-gray-600 text-center h-12 flex items-center justify-center">
      <svg
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
        className="w-5 h-5 text-gray-500"
        viewBox="0 0 24 24"
      >
        <path d="M18 6L6 18M6 6l12 12"></path>
      </svg>
    </p>
  );
};

export const QuestionIconButton = ({ tooltip }: { tooltip: string }) => {
  return (
    <Button
      size="mini"
      color="gray"
      shape="circle"
      variant="transparent"
      data-tooltip-id="my-tooltip-multiline"
      data-tooltip-html={tooltip}
      data-tooltip-variant="light"
    >
      <QuestionIcon className="h-auto w-3" />
    </Button>
  );
};
const PublicVsPrivateComparisionTable = () => {
  return (
    <section className="text-gray-700 body-font overflow-hidden border-t border-gray-200">
      <div className="container px-5 py-5 mx-auto flex flex-wrap">
        <div className="lg:w-1/3 mt-20 hidden lg:block">
          <div className="mt-px border-t border-gray-300 border-b border-l rounded-tl-lg rounded-bl-lg overflow-hidden">
            <p className="bg-gray-100 text-gray-900 h-12 text-center px-4 flex items-center justify-start -mt-px whitespace-nowrap">
              Description
            </p>
            <p className="text-gray-900 h-12 text-center px-4 flex items-center justify-start whitespace-nowrap">
              Audience Filter
              <QuestionIconButton tooltip="Filter you audience based <br/>on previous responses and some <br/> onchain verifiable elements" />
            </p>
            <p className="bg-gray-100 text-gray-900 h-12 text-center px-4 flex items-center justify-start whitespace-nowrap">
              Cost Efficient
              <QuestionIconButton tooltip="This feature ensures cost efficiency <br/> in survey creation and distribution." />
            </p>
            <p className="text-gray-900 h-12 text-center px-4 flex items-center justify-start whitespace-nowrap">
              Wider Audience Reach
              <QuestionIconButton tooltip="Everyone can see your survey. <br/>And based on your audience filter, answer it." />
            </p>
            <p className="bg-gray-100 text-gray-900 h-12 text-center px-4 flex items-center justify-start whitespace-nowrap">
              Question Text Private You
              <QuestionIconButton tooltip="If the question texts are private <br/> in nature, then go with Private Survey" />
            </p>
            <p className="text-gray-900 h-12 text-center px-4 flex items-center justify-start whitespace-nowrap">
              Can Use Question Bank
              <QuestionIconButton tooltip="Access and use existing question banks<br/> It saves cost for you in crearting new questions<br/> and help in open research." />
            </p>
            <p className="bg-gray-100 text-gray-900 h-12 text-center px-4 flex items-center justify-start whitespace-nowrap">
              Anonymity
              <QuestionIconButton tooltip="Creator and Respondent's Identifty remains Private <br/> No one at any time knows <br/> Who answered What? <br/> Who created What Survey <br/>" />
            </p>
          </div>
        </div>
        <div className="flex lg:w-2/3 w-full flex-wrap lg:border border-gray-300 rounded-lg">
          <div className="lg:w-1/2 lg:mt-px w-full mb-10 lg:mb-0 border-2 border-gray-300 lg:border-none rounded-lg lg:rounded-none">
            <div className="px-2 text-center h-20 flex flex-col items-center justify-center">
              <h3 className="tracking-widest font-semibold">PRIVATE</h3>
            </div>
            <GreyBgText str="Access by Approval/Invitation" />
            <WhiteBgCross />
            <GreyBgCross />
            <WhiteBgCross />
            <GreybgTick />
            <WhiteBgCross />
            <GreybgTick />
            <div className="border-t border-gray-300 p-6 text-center rounded-bl-lg">
              <ActiveLink
                href="https://docs.orcp.app/application-guide/for-organisations/creating-survey/survey-privacy"
                target="_blank"
              >
                <Button
                  size="mini"
                  className="w-full"
                  shape="rounded"
                  variant="solid"
                >
                  Read More
                </Button>
              </ActiveLink>
            </div>
          </div>
          <div className="lg:w-1/2 lg:-mt-px w-full mb-10 lg:mb-0 border-2 rounded-lg border-brand relative">
            <span className="bg-brand text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl">
              RECOMMENDED
            </span>
            <div className="px-2 text-center h-20 flex flex-col items-center justify-center">
              <h3 className="tracking-widest font-semibold">PUBLIC</h3>
            </div>
            <GreyBgText str="Accessible to all Respondants" />
            <WhitebgTick />
            <GreybgTick />
            <WhitebgTick />
            <GreyBgCross />
            <WhitebgTick />
            <GreybgTick />

            <div className="p-6 text-center border-t border-gray-300">
              <ActiveLink
                href="https://docs.orcp.app/application-guide/for-organisations/creating-survey/survey-privacy"
                target="_blank"
              >
                <Button
                  size="mini"
                  className="w-full"
                  shape="rounded"
                  variant="solid"
                >
                  Read More
                </Button>
              </ActiveLink>
            </div>
          </div>
        </div>
      </div>
      <Tooltip id="my-tooltip-multiline" />
    </section>
  );
};

export default PublicVsPrivateComparisionTable;
