import React from 'react';
// import { SectionWrapper, Text } from './styled';
import Checkbox from '@/components/ui/forms/checkbox';
import AnchorLink from '@/components/ui/links/anchor-link';
import Button from '@/components/ui/button';
// import ReactHtmlParser from 'react-html-parser';
import { useRecoilState } from 'recoil';
import { createRoot } from 'react-dom/client';
// import Markdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
import Markdown from 'markdown-to-jsx';
import { submittingResponseStatus } from '@/stores/atoms';

const customComponents = {
  h1: ({ children, ...props }) => (
    <h1
      style={{ fontSize: '2em', color: '#333', marginBottom: '0.5em' }}
      {...props}
    >
      <b>{children}</b>
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      style={{ fontSize: '1.5em', color: '#555', marginBottom: '0.5em' }}
      {...props}
    >
      <b>{children}</b>
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      style={{ fontSize: '1.2em', color: '#777', marginBottom: '0.5em' }}
      {...props}
    >
      <b>{children}</b>
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      style={{ fontSize: '1.1em', color: '#888', marginBottom: '0.5em' }}
      {...props}
    >
      <b>{children}</b>
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5
      style={{ fontSize: '1em', color: '#999', marginBottom: '0.5em' }}
      {...props}
    >
      <b>{children}</b>
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6
      style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '0.5em' }}
      {...props}
    >
      <b>{children}</b>
    </h6>
  ),
  p: ({ children, ...props }) => (
    <p style={{ marginBottom: '1em' }} {...props}>
      {children}
    </p>
  ),
  ol: ({ children, ...props }) => (
    <ol style={{ paddingLeft: '2em', listStyleType: 'decimal' }} {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li style={{ marginBottom: '0.5em' }} {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      style={{ borderLeft: '2px solid #ccc', paddingLeft: '1em' }}
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, ...props }) => (
    <a style={{ color: 'blue' }} {...props} target={'_blank'}>
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul style={{ paddingLeft: '2em', marginBottom: '1em' }} {...props}>
      {children}
    </ul>
  ),

  code: ({ children, ...props }) => (
    <code
      style={{
        backgroundColor: '#f4f4f4',
        padding: '0.2em 0.4em',
        borderRadius: '3px',
        fontFamily: 'monospace',
      }}
      {...props}
    >
      {children}
    </code>
  ),
};

const Section = ({ content, onNextStep, hideNextButton, isIntro, isEnd }) => {
  const [submittingResponse, setSubmittingResponse] = useRecoilState(
    submittingResponseStatus,
  );
  const [termschecked, setTermsChecked] = React.useState(false);

  return (
    <section className="overflow-hidden w-1/2 mx-auto">
      {content.map((item, index) => (
        <>
          {item.isTitle && (
            <p className="text-xl text-center mb-7 font-bold" key={index}>
              {item.value}
            </p>
          )}
          {!item.isTitle && !item.isOrgName && (
            <div
              className={
                'max-h-[40vh] overflow-y-auto ounded-lg bg-white p-4 rounded-xl shadow-xl transition-all duration-200  dark:bg-light-dark md:p-8 mb-3 mx-3 '
              }
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor:
                  '#888 transparent' /* Color of the scrollbar handle and track */,
                WebkitOverflowScrolling:
                  'touch' /* Enable momentum scrolling on iOS devices */,
              }}
            >
              <Markdown options={{ overrides: customComponents }}>
                {item.value}
              </Markdown>
            </div>
          )}
          {!item.isTitle && item.isOrgName && (
            <p className="text-base text-center mb-7" key={index}>
              Created By : <b> {item.value}</b>
            </p>
          )}
        </>
      ))}
      <div className="flex flex-col items-center">
        {isIntro && (
          <div className="mb-4">
            <Checkbox
              name="terms"
              onChange={() => setTermsChecked(!termschecked)}
              iconClassName="bg-[#4B5563] rounded mt-0.5"
              label={
                <>
                  I’ve read and agree with
                  <AnchorLink
                    href={'#'}
                    className="ml-2 font-medium tracking-[0.5px] underline dark:text-gray-300"
                  >
                    Terms of Service and Privacy Policy
                  </AnchorLink>
                </>
              }
              labelPlacement="end"
              labelClassName="ml-1.5 text-[#4B5563] !text-xs dark:text-gray-300 tracking-[0.5px] !leading-7"
              containerClassName="!items-start"
              inputClassName="mt-1 focus:!ring-offset-[1px]"
              size="sm"
            />
          </div>
        )}

        {isIntro && (
          <Button shape="rounded" onClick={onNextStep} disabled={!termschecked}>
            RESPOND NOW
          </Button>
        )}
        {isEnd && (
          <>
            <Button
              shape="rounded"
              isLoading={submittingResponse[1]}
              disabled={submittingResponse[1]}
              onClick={() => {
                onNextStep({ goback: true });
              }}
            >
              GO BACK
            </Button>
            <Button
              shape="rounded"
              className="mt-4"
              isLoading={submittingResponse[1]}
              disabled={submittingResponse[1]}
              onClick={() => {
                onNextStep({ goback: false });
              }}
            >
              SUBMIT YOUR RESPONSE
            </Button>
          </>
        )}
        {!hideNextButton && !isIntro && !isEnd && (
          <Button shape="rounded" onClick={onNextStep}>
            NEXT
          </Button>
        )}
      </div>
    </section>
  );
};

export default Section;
